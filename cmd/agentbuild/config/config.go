package config

import (
	"github.com/ForTheChurch/buildforthechurch/internal/gloo"
	"github.com/ForTheChurch/buildforthechurch/internal/scraper"
)

type Config struct {
	Gloo    gloo.Config
	Scraper scraper.FirecrawlConfig
}
