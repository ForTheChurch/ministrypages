package config

import (
	"github.com/ForTheChurch/buildforthechurch/internal/gloo"
	"github.com/ForTheChurch/buildforthechurch/internal/payloadcms"
	"github.com/ForTheChurch/buildforthechurch/internal/scraper"
)

type Config struct {
	Gloo       gloo.Config
	Scraper    scraper.FirecrawlConfig
	PayloadCMS payloadcms.Config

	Port        string `env:"AGENT_API_PORT,required"`
	AgentAPIKey string `env:"AGENT_API_KEY,required"`
}
