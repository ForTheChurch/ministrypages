package main

import (
	"context"
	"fmt"
	"log"

	"github.com/ForTheChurch/buildforthechurch/internal/gloo"
	"github.com/caarlos0/env/v11"
	"github.com/docker/cagent/pkg/agent"
	latest "github.com/docker/cagent/pkg/config/v2"
	"github.com/docker/cagent/pkg/model/provider/openai"
	"github.com/docker/cagent/pkg/runtime"
	"github.com/docker/cagent/pkg/session"
	"github.com/docker/cagent/pkg/team"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	var cfg gloo.Config
	if err := env.Parse(&cfg); err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()

	trackUsage := false // Gloo fails with usage tracking enabled

	// Gloo mimics the openai API best
	llm, err := openai.NewClient(
		ctx,
		&latest.ModelConfig{
			Provider:   "openai",
			Model:      "us.anthropic.claude-sonnet-4-20250514-v1:0",
			BaseURL:    gloo.BaseURL,
			TrackUsage: &trackUsage,
		},
		gloo.NewProvider(cfg),
	)
	if err != nil {
		log.Fatal(err)
	}

	human := agent.New(
		"root",
		"You are a church website builder.",
		agent.WithModel(llm),
		agent.WithDescription("A church website builder."),
	)

	humanTeam := team.New(team.WithAgents(human))

	rt, err := runtime.New(humanTeam)
	if err != nil {
		log.Fatal(err)
	}

	sess := session.New(session.WithUserMessage("", "What are important things to have on a church website?"))

	messages, err := rt.Run(ctx, sess)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(messages[len(messages)-1].Message.Content)
}
