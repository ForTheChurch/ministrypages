package gloo

import (
	"context"
	"log/slog"
	"os"
	"strings"
	"sync"
)

const BaseURL = "https://platform.ai.gloo.com/ai/v1"

type GlooProvider struct {
	cfg Config

	once        sync.Once
	accessToken string
}

func NewProvider(cfg Config) *GlooProvider {
	return &GlooProvider{
		cfg: cfg,
	}
}

// TODO: handle expiration of access token
func (p *GlooProvider) Get(ctx context.Context, name string) string {
	if strings.HasSuffix(name, "_API_KEY") { // OPENAI_API_KEY
		p.once.Do(func() {
			accessToken, err := GetAccessToken(ctx, p.cfg.ClientID, p.cfg.ClientSecret)
			if err != nil {
				slog.Error("failed to get access token", "error", err)
				return // TODO: handle error
			}
			p.accessToken = accessToken
		})
		return p.accessToken
	}
	return os.Getenv(name)
}
