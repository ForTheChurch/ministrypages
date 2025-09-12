package scraper

type ScrapeResult struct {
	Html     string
	Markdown string
	Error    error
}

type Scraper interface {
	Scrape(url string) chan ScrapeResult
}
