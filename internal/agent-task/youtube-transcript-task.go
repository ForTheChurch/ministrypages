package agenttask

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
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
)

type YoutubeTranscriptTask struct {
	id               string
	url              string
	postId           string
	firecrawlScraper scraper.Scraper
	payloadCMSClient *payloadcms.Client
	llm              provider.Provider
	transcriptCache  pagecache.PageCache
	metadataCache    pagecache.PageCache
}

func NewYoutubeTranscriptTask(url string, postId string, firecrawlScraper scraper.Scraper, payloadCMSClient *payloadcms.Client, llm provider.Provider) *YoutubeTranscriptTask {
	return &YoutubeTranscriptTask{
		id:               newTaskId(),
		url:              url,
		postId:           postId,
		firecrawlScraper: firecrawlScraper,
		payloadCMSClient: payloadCMSClient,
		llm:              llm,
		transcriptCache:  pagecache.NewPageCache("md"),
		metadataCache:    pagecache.NewPageCache("json"),
	}
}

var _ AgentTask = &YoutubeTranscriptTask{}

func (t *YoutubeTranscriptTask) ID() string {
	return t.id
}

func (t *YoutubeTranscriptTask) Execute(ctx context.Context) error {
	log.Println("[YoutubeTranscriptTask] Started for", t.url)

	// 8 minutes, transcripts can be long
	ctx, cancel := context.WithTimeout(ctx, 8*time.Minute)
	defer cancel()

	var transcript string
	var title string
	cachedTranscript, err := t.transcriptCache.GetCachedPage(t.url)
	if err != nil {
		return fmt.Errorf("error getting cached transcript: %w", err)
	}
	cachedMetadata, err := t.metadataCache.GetCachedPage(t.url)
	if err != nil {
		return fmt.Errorf("error getting cached metadata: %w", err)
	}
	if cachedTranscript != "" && cachedMetadata != "" {
		transcript = cachedTranscript
		var metadata map[string]string
		if err := json.Unmarshal([]byte(cachedMetadata), &metadata); err != nil {
			return fmt.Errorf("error unmarshalling cached metadata: %w", err)
		}
		title = metadata["title"]

		log.Println("[YoutubeTranscriptTask] Using cached transcript")
	} else {
		log.Println("[YoutubeTranscriptTask] No cached transcript or metadata found, scraping page")
		var metadata map[string]string
		transcript, metadata, err = t.scrapeYoutubeTranscript(ctx)
		if err != nil {
			return fmt.Errorf("error scraping YouTube transcript: %w", err)
		}

		title = metadata["title"]

		if err := t.transcriptCache.SetCachedPage(t.url, transcript); err != nil {
			return fmt.Errorf("error caching transcript: %w", err)
		}

		var metadataJSON []byte
		if metadataJSON, err = json.Marshal(metadata); err != nil {
			return fmt.Errorf("error marshalling metadata: %w", err)
		}
		if err := t.metadataCache.SetCachedPage(t.url, string(metadataJSON)); err != nil {
			return fmt.Errorf("error caching metadata: %w", err)
		}
	}

	// Title usually contains " - YouTube", so we remove it
	title = strings.TrimSpace(strings.ReplaceAll(title, " - YouTube", ""))

	youtubeTranscriptPrompt, err := prompt.GetYoutubeTranscriptPrompt()
	if err != nil {
		return fmt.Errorf("error getting youtube transcript prompt: %w", err)
	}

	ctx, b, cleanup := newBail(ctx)
	defer cleanup()

	rootAgent := agent.New(
		"root",
		youtubeTranscriptPrompt,
		agent.WithModel(t.llm),
		agent.WithDescription("An agent that converts a sermon YouTube transcript into a formatted markdown document."),
		agent.WithTools(
			b.BailAfterSuccessfulToolCall(toolExportMarkdown("YoutubeTranscriptTask", t.postId, title, t.url, t.payloadCMSClient)),
		))

	agentTeam := team.New(team.WithAgents(rootAgent))

	rt, err := runtime.New(agentTeam)
	if err != nil {
		return fmt.Errorf("error creating runtime: %w", err)
	}

	p := "The title of the sermon is \"" + title + "\"\n\nBelow is the raw transcript:\n\n" + transcript
	sess := session.New(session.WithUserMessage("", p))
	sess.ToolsApproved = true

	if _, err = rt.Run(ctx, sess); err != nil {
		return fmt.Errorf("error running agent: %w", err)
	}

	log.Println("[YoutubeTranscriptTask] completed for", t.url)

	return nil
}

func (t *YoutubeTranscriptTask) scrapeYoutubeTranscript(ctx context.Context) (string, map[string]string, error) {
	log.Println("[YoutubeTranscriptTask] Scraping YouTube transcript for", t.url)
	resultCh := t.firecrawlScraper.Scrape(t.url)

	var result scraper.ScrapeResult
	select {
	case result = <-resultCh:
		break
	case <-ctx.Done():
		return "", nil, ctx.Err()
	}

	if result.Error != nil {
		log.Println("[YoutubeTranscriptTask] Error scraping YouTube transcript:", result.Error)
		return "", nil, result.Error
	}

	return result.Markdown, result.Metadata, nil
}
