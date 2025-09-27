package scraper

type ScrapeResult struct {
	Html     string
	Markdown string
	Metadata map[string]string
	Error    error
}

type CrawlResult struct {
	Pages map[string]ScrapeResult
	Error error
}

type Scraper interface {
	Scrape(url string) chan ScrapeResult
	Crawl(url string) chan CrawlResult
}
