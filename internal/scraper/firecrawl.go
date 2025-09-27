package scraper

import (
	"fmt"
	"strings"

	"github.com/mendableai/firecrawl-go/v2"
)

type FirecrawlConfig struct {
	FirecrawlAPIKey string `env:"FIRECRAWL_API_KEY,required"`
}

type firecrawlScraper struct {
	app *firecrawl.FirecrawlApp
}

var _ Scraper = &firecrawlScraper{}

func NewFirecrawl(cfg FirecrawlConfig) (Scraper, error) {
	app, err := firecrawl.NewFirecrawlApp(cfg.FirecrawlAPIKey, "https://api.firecrawl.dev")
	if err != nil {
		return nil, err
	}
	return &firecrawlScraper{
		app: app,
	}, nil
}

func (s *firecrawlScraper) Scrape(url string) chan ScrapeResult {
	ch := make(chan ScrapeResult)

	go func() {
		defer close(ch)

		doc, err := s.app.ScrapeURL(url, &firecrawl.ScrapeParams{
			Formats: []string{"html", "markdown"},
		})
		if err != nil {
			ch <- ScrapeResult{Error: err}
			return
		}

		html := doc.HTML
		markdown := doc.Markdown

		if html == "" {
			ch <- ScrapeResult{Error: fmt.Errorf("no html returned from firecrawl")}
			return
		}

		metadata := make(map[string]string)
		if doc.Metadata != nil && doc.Metadata.Title != nil {
			metadata["title"] = *doc.Metadata.Title
		}

		ch <- ScrapeResult{Html: html, Markdown: markdown, Metadata: metadata}
	}()
	return ch
}

func (s *firecrawlScraper) Crawl(url string) chan CrawlResult {
	ch := make(chan CrawlResult)

	go func() {
		defer close(ch)

		limit := 20
		ignoreQueryParameters := true

		response, err := s.app.CrawlURL(url, &firecrawl.CrawlParams{
			Limit:                 &limit,
			IgnoreQueryParameters: &ignoreQueryParameters,
			ScrapeOptions: firecrawl.ScrapeParams{
				Formats: []string{"html", "markdown"},
			},
		}, nil)
		if err != nil {
			ch <- CrawlResult{Error: err}
			return
		}

		// TODO track failed scrapes

		crawlResult := CrawlResult{
			Pages: make(map[string]ScrapeResult),
		}

		for _, doc := range response.Data {
			if doc.Metadata != nil && doc.Metadata.URL != nil && strings.HasSuffix(*doc.Metadata.URL, ".pdf") {
				// Skip PDFs (how do I do this better?)
				continue
			}
			scrapeResult := ScrapeResult{
				Html:     doc.HTML,
				Markdown: doc.Markdown,
				Metadata: make(map[string]string),
			}
			if doc.Metadata != nil && doc.Metadata.Title != nil {
				scrapeResult.Metadata["title"] = *doc.Metadata.Title
			}
			crawlResult.Pages[*doc.Metadata.URL] = scrapeResult
		}

		ch <- crawlResult
	}()
	return ch
}
