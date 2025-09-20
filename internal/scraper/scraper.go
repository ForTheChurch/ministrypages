package scraper

type ScrapeResult struct {
	Html     string
	Markdown string
	Metadata map[string]string
	Error    error
}

type Scraper interface {
	Scrape(url string) chan ScrapeResult
}
