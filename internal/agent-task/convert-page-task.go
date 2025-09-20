package agenttask

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
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
	"github.com/docker/cagent/pkg/tools"
)

type ConvertPageTask struct {
	id               string
	url              string
	pageID           string
	firecrawlScraper scraper.Scraper
	payloadCMSClient *payloadcms.Client
	llm              provider.Provider
	pageCache        pagecache.PageCache
}

func NewConvertPageTask(url string, pageID string, firecrawlScraper scraper.Scraper, payloadCMSClient *payloadcms.Client, llm provider.Provider) *ConvertPageTask {
	return &ConvertPageTask{
		id:               newTaskId(),
		url:              url,
		pageID:           pageID,
		firecrawlScraper: firecrawlScraper,
		payloadCMSClient: payloadCMSClient,
		llm:              llm,
		pageCache:        pagecache.NewPageCache("html"),
	}
}

var _ AgentTask = &ConvertPageTask{}

func (t *ConvertPageTask) ID() string {
	return t.id
}

func (t *ConvertPageTask) Execute(ctx context.Context) error {
	log.Println("[ConvertPageTask] Started for", t.url)

	// 120 second timeout
	ctx, cancel := context.WithTimeout(ctx, 120*time.Second)
	defer cancel()

	var html string
	cachedPage, err := t.pageCache.GetCachedPage(t.url)
	if err != nil {
		return fmt.Errorf("error getting cached page: %w", err)
	}
	if cachedPage != "" {
		html = cachedPage
		log.Println("[ConvertPageTask] Using cached page")
	} else {
		log.Println("[ConvertPageTask] No cached page found, scraping page")
		html, err = t.scrapePageHtml(ctx)
		if err != nil {
			return fmt.Errorf("error scraping page HTML: %w", err)
		}
		if err := t.pageCache.SetCachedPage(t.url, html); err != nil {
			return fmt.Errorf("error caching page: %w", err)
		}
	}

	convertPagePrompt, err := prompt.GetConvertPagePrompt()
	if err != nil {
		return fmt.Errorf("error getting convert page prompt: %w", err)
	}

	toolUploadMedia := tools.Tool{
		Handler: func(ctx context.Context, toolCall tools.ToolCall) (*tools.ToolCallResult, error) {
			log.Println("[ConvertPageTask] Upload media tool called")

			type params struct {
				URL string `json:"url"`
			}
			var p params
			if err := json.Unmarshal([]byte(toolCall.Function.Arguments), &p); err != nil {
				return nil, err
			}

			log.Println("[ConvertPageTask] Uploading media from", p.URL)

			filename, err := getMediaFilename(p.URL)
			if err != nil {
				return nil, fmt.Errorf("error getting media filename: %w", err)
			}

			media, err := downloadMedia(ctx, p.URL)
			if err != nil {
				return nil, fmt.Errorf("error downloading media: %w", err)
			}

			id, err := t.payloadCMSClient.UploadMedia(ctx, filename, media)
			if err != nil {
				return nil, fmt.Errorf("error uploading media: %w", err)
			}

			return &tools.ToolCallResult{
				Output: "Media uploaded successfully. Media ID: " + id,
			}, nil
		},
		Function: &tools.FunctionDefinition{
			Name:        "upload-media",
			Description: "Upload a media file to the CMS (picture, video, audio, etc.)",
			Parameters: tools.FunctionParamaters{
				Type: "object",
				Properties: map[string]any{
					"url": map[string]any{
						"type":        "string",
						"description": "The URL of the media file to upload",
					},
				},
				Required: []string{"url"},
			},
		},
	}

	toolExportPage := tools.Tool{
		Handler: func(ctx context.Context, toolCall tools.ToolCall) (*tools.ToolCallResult, error) {
			log.Println("[ConvertPageTask] Export page tool called")

			_ = os.MkdirAll("output", 0755)
			// Write the page JSON to a file for debugging
			_ = os.WriteFile(filepath.Join("output", "generated-page-"+t.pageID+".json"), []byte(toolCall.Function.Arguments), 0644)

			type params struct {
				PageJSON string `json:"pageJSON"`
			}
			var p params
			if err := json.Unmarshal([]byte(toolCall.Function.Arguments), &p); err != nil {
				return nil, err
			}

			var pageData payloadcms.PagePatch
			if err := json.Unmarshal([]byte(p.PageJSON), &pageData); err != nil {
				return nil, err
			}

			pageData.ID = t.pageID

			log.Println("[ConvertPageTask] Patching page produced by agent")

			if err := t.payloadCMSClient.UpdatePage(ctx, pageData); err != nil {
				log.Println("[ConvertPageTask] Error patching page:", err)
				return nil, err
			}

			return &tools.ToolCallResult{
				Output: "Page exported successfully",
			}, nil
		},
		Function: &tools.FunctionDefinition{
			Name:        "export-page",
			Description: "Export the page JSON to a file",
			Parameters: tools.FunctionParamaters{
				Type: "object",
				Properties: map[string]any{
					"pageJSON": map[string]any{
						"type":        "string",
						"description": "The JSON object representing the page",
					},
				},
				Required: []string{"pageJSON"},
			},
		},
	}

	rootAgent := agent.New(
		"root",
		convertPagePrompt,
		agent.WithModel(t.llm),
		agent.WithDescription("An agent that converts church website HTML into a PayloadCMS Page JSON object."),
		agent.WithTools(toolExportPage, toolUploadMedia),
	)

	agentTeam := team.New(team.WithAgents(rootAgent))

	rt, err := runtime.New(agentTeam)
	if err != nil {
		return fmt.Errorf("error creating runtime: %w", err)
	}

	p := "I retrieved the following HTML from a church website at " + t.url + "\n\n" + html
	sess := session.New(session.WithUserMessage("", p))
	sess.ToolsApproved = true

	if _, err = rt.Run(ctx, sess); err != nil {
		return fmt.Errorf("error running agent: %w", err)
	}

	log.Println("[ConvertPageTask] completed for", t.url)

	return nil
}

func (t *ConvertPageTask) scrapePageHtml(ctx context.Context) (string, error) {
	log.Println("[ConvertPageTask] Scraping page at", t.url)
	resultCh := t.firecrawlScraper.Scrape(t.url)

	var result scraper.ScrapeResult
	select {
	case result = <-resultCh:
		break
	case <-ctx.Done():
		return "", ctx.Err()
	}

	if result.Error != nil {
		log.Println("[ConvertPageTask] Error scraping page:", result.Error)
		return "", result.Error
	}

	return result.Html, nil
}

func downloadMedia(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

func getMediaFilename(mediaUrl string) (string, error) {
	// TODO consider content-disposition header
	u, err := url.Parse(mediaUrl)
	if err != nil {
		return "", fmt.Errorf("error parsing media URL: %w", err)
	}
	return filepath.Base(u.Path), nil
}
