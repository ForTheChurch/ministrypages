package services

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/ForTheChurch/buildforthechurch/cmd/api/config"
	agenttaskmanager "github.com/ForTheChurch/buildforthechurch/internal/agent-task-manager"
	"github.com/ForTheChurch/buildforthechurch/internal/gloo"
	"github.com/ForTheChurch/buildforthechurch/internal/payloadcms"
	"github.com/ForTheChurch/buildforthechurch/internal/scraper"
	latest "github.com/docker/cagent/pkg/config/v2"
	"github.com/docker/cagent/pkg/environment"
	"github.com/docker/cagent/pkg/model/provider"
	"github.com/docker/cagent/pkg/model/provider/anthropic"
	"github.com/docker/cagent/pkg/model/provider/openai"
)

type Services struct {
	payloadCMSClient *payloadcms.Client
	scraper          scraper.Scraper
	agentTaskManager *agenttaskmanager.AgentTaskManager
	llm              provider.Provider
}

func NewServices(ctx context.Context, cfg config.Config) (*Services, error) {
	scraper, err := scraper.NewFirecrawl(cfg.Scraper)
	if err != nil {
		return nil, err
	}

	agentTaskManager := agenttaskmanager.New()
	agentTaskManager.Start(ctx)

	// Gloo fails with usage tracking enabled
	trackUsage := false

	var llm provider.Provider
	if os.Getenv("USE_ANTHROPIC_API") == "true" {
		if os.Getenv("ANTHROPIC_API_KEY") == "" {
			log.Fatal("ANTHROPIC_API_KEY is not set")
		}
		llm, err = anthropic.NewClient(
			ctx,
			&latest.ModelConfig{
				Provider:   "anthropic",
				Model:      "claude-sonnet-4-0",
				MaxTokens:  64000,
				TrackUsage: &trackUsage,
			},
			environment.NewOsEnvProvider(),
		)
		if err != nil {
			log.Fatal(err)
		}
	} else {
		// Gloo mimics the openai API best
		llm, err = openai.NewClient(
			ctx,
			&latest.ModelConfig{
				Provider:   "openai",
				Model:      "us.anthropic.claude-sonnet-4-20250514-v1:0",
				BaseURL:    gloo.BaseURL,
				MaxTokens:  64000,
				TrackUsage: &trackUsage,
			},
			gloo.NewProvider(cfg.Gloo),
		)
		if err != nil {
			log.Fatal(err)
		}
	}

	return &Services{
		payloadCMSClient: payloadcms.NewClient(cfg.PayloadCMS, http.DefaultClient),
		scraper:          scraper,
		agentTaskManager: agentTaskManager,
		llm:              llm,
	}, nil
}

func (s *Services) GetPayloadCMSClient() *payloadcms.Client {
	return s.payloadCMSClient
}

func (s *Services) GetScraper() scraper.Scraper {
	return s.scraper
}

func (s *Services) GetAgentTaskManager() *agenttaskmanager.AgentTaskManager {
	return s.agentTaskManager
}

func (s *Services) GetLLM() provider.Provider {
	return s.llm
}
