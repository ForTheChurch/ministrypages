package agenttask

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
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
}

func NewConvertPageTask(url string, pageID string, firecrawlScraper scraper.Scraper, payloadCMSClient *payloadcms.Client, llm provider.Provider) *ConvertPageTask {
	return &ConvertPageTask{
		id:               newTaskId(),
		url:              url,
		pageID:           pageID,
		firecrawlScraper: firecrawlScraper,
		payloadCMSClient: payloadCMSClient,
		llm:              llm,
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
	cachedPage, err := pagecache.GetCachedPage(t.url)
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
		if err := pagecache.SetCachedPage(t.url, html); err != nil {
			return fmt.Errorf("error caching page: %w", err)
		}
	}

	convertPagePrompt, err := prompt.GetConvertPagePrompt()
	if err != nil {
		return fmt.Errorf("error getting convert page prompt: %w", err)
	}

	toolExportPage := tools.Tool{
		Handler: func(ctx context.Context, toolCall tools.ToolCall) (*tools.ToolCallResult, error) {
			log.Println("[ConvertPageTask] Parsing page produced by agent")

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
		agent.WithTools(toolExportPage),
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
