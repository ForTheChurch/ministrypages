package agenttask

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"strings"
	"time"

	"github.com/ForTheChurch/buildforthechurch/internal/pagecache"
	"github.com/ForTheChurch/buildforthechurch/internal/payloadcms"
	"github.com/ForTheChurch/buildforthechurch/internal/prompt"
	"github.com/ForTheChurch/buildforthechurch/internal/scraper"
	"github.com/docker/cagent/pkg/agent"
	"github.com/docker/cagent/pkg/model/provider"
	"github.com/docker/cagent/pkg/runtime"
	"github.com/docker/cagent/pkg/session"
	"github.com/docker/cagent/pkg/team"
	"golang.org/x/sync/errgroup"
)

// siteData is a map of page urls to their title and html
type siteData = map[string]struct {
	Title string
	Html  string
}

type ConvertWholeSiteTask struct {
	id               string
	url              string
	firecrawlScraper scraper.Scraper
	payloadCMSClient *payloadcms.Client
	llm              provider.Provider
	pageCache        pagecache.PageCache
	siteCache        pagecache.PageCache
}

func NewConvertWholeSiteTask(url string, firecrawlScraper scraper.Scraper, payloadCMSClient *payloadcms.Client, llm provider.Provider) *ConvertWholeSiteTask {
	return &ConvertWholeSiteTask{
		id:               newTaskId(),
		url:              url,
		firecrawlScraper: firecrawlScraper,
		payloadCMSClient: payloadCMSClient,
		llm:              llm,
		pageCache:        pagecache.NewPageCache("html"),
		siteCache:        pagecache.NewPageCache("json"),
	}
}

var _ AgentTask = &ConvertWholeSiteTask{}

func (t *ConvertWholeSiteTask) ID() string {
	return t.id
}

func (t *ConvertWholeSiteTask) Execute(ctx context.Context) error {
	log.Println("[ConvertWholeSiteTask] Started for", t.url)

	// 5 minute timeout
	ctx, cancel := context.WithTimeout(ctx, 300*time.Second)
	defer cancel()

	// Check if we crawled this site already
	siteData, err := t.getCachedSiteData()
	if err != nil {
		return fmt.Errorf("error getting cached site index: %w", err)
	}
	if siteData != nil {
		log.Println("[ConvertWholeSiteTask] Using cached site index")
	} else {
		log.Println("[ConvertWholeSiteTask] No cached site index found, crawling site")
		siteData, err = t.crawlSite(ctx)
		if err != nil {
			return fmt.Errorf("error crawling site: %w", err)
		}
		if err := t.setCachedSiteData(siteData); err != nil {
			return fmt.Errorf("error caching site data: %w", err)
		}
	}

	eg, ctx := errgroup.WithContext(ctx)
	eg.SetLimit(4) // 4 concurrent page conversions
	for url, data := range siteData {
		eg.Go(func() error {
			slug, err := getPageSlug(url)
			if err != nil {
				return fmt.Errorf("error getting page slug: %w", err)
			}
			pageId, err := t.createPageInPayload(ctx, data.Title, slug)
			if err != nil {
				return fmt.Errorf("error creating page in payload: %w", err)
			}
			return t.convertPage(ctx, url, pageId, data)
		})
	}

	err = eg.Wait()
	if err != nil {
		return fmt.Errorf("error converting pages: %w", err)
	}

	log.Println("[ConvertWholeSiteTask] Completed for", t.url)

	return nil
}

func getPageSlug(u string) (string, error) {
	rawUrl, err := url.Parse(u)
	if err != nil {
		return "", fmt.Errorf("error parsing url: %w", err)
	}
	if rawUrl.Path == "/" {
		return "home", nil
	}

	// Converts /about/ministries to about-ministries
	return strings.ReplaceAll(
		strings.TrimPrefix(strings.TrimSuffix(rawUrl.Path, "/"), "/"),
		"/",
		"-",
	), nil
}

func (t *ConvertWholeSiteTask) createPageInPayload(ctx context.Context, title string, slug string) (string, error) {
	log.Println("[ConvertWholeSiteTask] Creating page in payload for", slug)
	return t.payloadCMSClient.CreatePage(ctx, title, slug)
}

func (t *ConvertWholeSiteTask) convertPage(ctx context.Context, url string, pageID string, data struct {
	Title string
	Html  string
}) error {
	log.Println("[ConvertWholeSiteTask] Converting page at", url)

	convertPagePrompt, err := prompt.GetConvertPagePrompt()
	if err != nil {
		return fmt.Errorf("error getting convert page prompt: %w", err)
	}

	ctx, b, cleanup := newBail(ctx)
	defer cleanup()

	rootAgent := agent.New(
		"root",
		convertPagePrompt,
		agent.WithModel(t.llm),
		agent.WithDescription("An agent that converts church website HTML into a PayloadCMS Page JSON object."),
		agent.WithTools(
			b.BailAfterSuccessfulToolCall(toolExportPage("ConvertWholeSiteTask", pageID, t.payloadCMSClient)),
			toolUploadMedia("ConvertWholeSiteTask", t.payloadCMSClient)),
	)

	agentTeam := team.New(team.WithAgents(rootAgent))

	rt, err := runtime.New(agentTeam)
	if err != nil {
		return fmt.Errorf("error creating runtime: %w", err)
	}

	p := "I retrieved the following HTML from a church website at " + t.url + "\n\n" + data.Html
	sess := session.New(session.WithUserMessage("", p))
	sess.ToolsApproved = true

	if _, err = rt.Run(ctx, sess); err != nil {
		return fmt.Errorf("error running agent: %w", err)
	}

	log.Println("[ConvertWholeSiteTask] Completed for page at", url)

	return nil
}

func (t *ConvertWholeSiteTask) crawlSite(ctx context.Context) (siteData, error) {
	log.Println("[ConvertWholeSiteTask] Crawling site at", t.url)
	resultCh := t.firecrawlScraper.Crawl(t.url)

	var result scraper.CrawlResult
	select {
	case result = <-resultCh:
		break
	case <-ctx.Done():
		return nil, ctx.Err()
	}

	if result.Error != nil {
		log.Println("[ConvertWholeSiteTask] Error crawling site:", result.Error)
		return nil, fmt.Errorf("error crawling site: %w", result.Error)
	}

	// Convert the crawl result to site data
	siteData := make(siteData)
	for url, result := range result.Pages {
		siteData[url] = struct {
			Title string
			Html  string
		}{
			Title: result.Metadata["title"],
			Html:  result.Html,
		}
	}

	return siteData, nil
}

type siteMap = map[string]struct {
	Title string
	Url   string
}

func (t *ConvertWholeSiteTask) getCachedSiteData() (siteData, error) {
	var siteMap siteMap
	data, err := t.siteCache.GetCachedPage(t.url)
	if err != nil {
		return nil, fmt.Errorf("error getting cached site data: %w", err)
	}

	if data == "" {
		return nil, nil
	}

	if err := json.Unmarshal([]byte(data), &siteMap); err != nil {
		return nil, fmt.Errorf("error unmarshalling cached site data: %w", err)
	}

	siteData := make(siteData)

	// Load the html for each page
	for _, page := range siteMap {
		html, err := t.pageCache.GetCachedPage(page.Url)
		if err != nil {
			return nil, fmt.Errorf("error getting cached page: %w", err)
		}
		if html == "" {
			return nil, fmt.Errorf("cached page is empty: %s", page.Url)
		}
		siteData[page.Url] = struct {
			Title string
			Html  string
		}{
			Title: page.Title,
			Html:  html,
		}
	}

	return siteData, nil
}

func (t *ConvertWholeSiteTask) setCachedSiteData(siteData siteData) error {
	// Cache each page
	for url, data := range siteData {
		if err := t.pageCache.SetCachedPage(url, data.Html); err != nil {
			return fmt.Errorf("error caching page data: %w", err)
		}
	}

	// Cache the whole site map
	siteMap := make(siteMap)
	for url, data := range siteData {
		siteMap[url] = struct {
			Title string
			Url   string
		}{
			Title: data.Title,
			Url:   url,
		}
	}
	data, err := json.Marshal(siteMap)
	if err != nil {
		return fmt.Errorf("error marshalling site data: %w", err)
	}
	if err := t.siteCache.SetCachedPage(t.url, string(data)); err != nil {
		return fmt.Errorf("error caching site data: %w", err)
	}

	return nil
}
