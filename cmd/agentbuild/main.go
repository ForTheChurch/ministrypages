package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"os"
	"path/filepath"
	"strings"

	"github.com/ForTheChurch/buildforthechurch/cmd/agentbuild/config"
	"github.com/ForTheChurch/buildforthechurch/internal/gloo"
	"github.com/ForTheChurch/buildforthechurch/internal/prompt"
	"github.com/ForTheChurch/buildforthechurch/internal/scraper"
	"github.com/caarlos0/env/v11"
	"github.com/docker/cagent/pkg/agent"
	latest "github.com/docker/cagent/pkg/config/v2"
	"github.com/docker/cagent/pkg/model/provider/openai"
	"github.com/docker/cagent/pkg/runtime"
	"github.com/docker/cagent/pkg/session"
	"github.com/docker/cagent/pkg/team"
	"github.com/docker/cagent/pkg/tools"
	"github.com/fatih/color"
	"github.com/joho/godotenv"
)

// THESE ARE TEST VALUES! CHANGE THEM AS YOU LIKE!
// ----------------
// The URL to convert
const testUrl = "https://wbcalliance.com/about/our-beliefs/"

// Set to false to scrape the page the first time
// Set to true to reuse the page HTML that was scraped the first time
const reusePage = false

// ----------------

// text colors
var (
	blue = color.New(color.FgBlue).SprintfFunc()
	// yellow = color.New(color.FgYellow).SprintfFunc()
	red  = color.New(color.FgRed).SprintfFunc()
	gray = color.New(color.FgHiBlack).SprintfFunc()
)

// text styles
var bold = color.New(color.Bold).SprintfFunc()

func main() {
	// slog.SetLogLoggerLevel(slog.LevelDebug)
	fmt.Println("Reading config")

	err := godotenv.Load()
	if err != nil {
		if os.IsNotExist(err) {
			slog.Info("no .env file found, skipping")
		} else {
			log.Fatal(err)
		}
	}

	var cfg config.Config
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
		gloo.NewProvider(cfg.Gloo),
	)
	if err != nil {
		log.Fatal(err)
	}

	_ = os.Mkdir("output", 0755) //nolint:errcheck

	html := ""

	if reusePage {
		fmt.Println("Reusing page HTML from output/page.html")

		htmlBytes, err := os.ReadFile(filepath.Join("output", "page.html"))
		if err != nil {
			log.Fatal(err)
		}
		html = string(htmlBytes)
	} else {
		firecrawlScraper, err := scraper.NewFirecrawl(cfg.Scraper)
		if err != nil {
			log.Fatal(err)
		}

		fmt.Println("Scraping page at", testUrl)
		resultCh := firecrawlScraper.Scrape(testUrl)
		result := <-resultCh

		if result.Error != nil {
			log.Fatal(result.Error)
		}

		fmt.Println("Writing page HTML to output/page.html")
		if err := os.WriteFile(filepath.Join("output", "page.html"), []byte(result.Html), 0644); err != nil {
			log.Fatal(err)
		}

		fmt.Println("Writing page Markdown to output/page.md")
		if err := os.WriteFile(filepath.Join("output", "page.md"), []byte(result.Markdown), 0644); err != nil {
			log.Fatal(err)
		}

		html = result.Html
	}

	convertPagePrompt, err := prompt.GetConvertPagePrompt()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Writing convert page prompt to output/convert-page-prompt.md")
	if err = os.WriteFile(filepath.Join("output", "convert-page-prompt.md"), []byte(convertPagePrompt), 0644); err != nil {
		log.Fatal(err)
	}

	toolExportPage := tools.Tool{
		Handler: func(ctx context.Context, toolCall tools.ToolCall) (*tools.ToolCallResult, error) {
			fmt.Println(blue("Exporting page"))
			type params struct {
				PageJSON string `json:"pageJSON"`
			}
			var p params
			if err := json.Unmarshal([]byte(toolCall.Function.Arguments), &p); err != nil {
				return nil, err
			}

			if err := os.WriteFile(filepath.Join("output", "generated-page.json"), []byte(p.PageJSON), 0644); err != nil {
				return nil, err
			}

			return &tools.ToolCallResult{
				Output: "Page exported successfully",
			}, nil
		},
		Function: &tools.FunctionDefinition{
			Name:        "export-page",
			Description: "Export the page JSON to a file",
			Parameters: tools.FunctionParamaters{
				Type: "object",
				Properties: map[string]any{
					"pageJSON": map[string]any{
						"type": "string",
					},
				},
			},
		},
	}

	rootAgent := agent.New(
		"root",
		convertPagePrompt,
		agent.WithModel(llm),
		agent.WithDescription("An agent that converts church website HTML into a PayloadCMS Page JSON object."),
		agent.WithTools(toolExportPage),
	)

	agentTeam := team.New(team.WithAgents(rootAgent))

	rt, err := runtime.New(agentTeam)
	if err != nil {
		log.Fatal(err)
	}

	p := "I retrieved the following HTML from a church website at " + testUrl + "\n\n" + html
	sess := session.New(session.WithUserMessage("", p))
	sess.ToolsApproved = true

	fmt.Printf("Starting session with user message: %s...\n", trimString(p, 200))

	llmIsTyping := false

	for event := range rt.RunStream(ctx, sess) {
		switch e := event.(type) {
		case *runtime.AgentChoiceEvent:
			if !llmIsTyping {
				fmt.Println()
				llmIsTyping = true
			}
			fmt.Printf("%s", e.Content)
		case *runtime.ToolCallEvent:
			if llmIsTyping {
				fmt.Println()
				llmIsTyping = false
			}
			printToolCall(e.ToolCall)
		case *runtime.ToolCallResponseEvent:
			if llmIsTyping {
				fmt.Println()
				llmIsTyping = false
			}
			printToolCallResponse(e.ToolCall, e.Response)
		case *runtime.ErrorEvent:
			if llmIsTyping {
				fmt.Println()
				llmIsTyping = false
			}
			printError(fmt.Errorf("%s", e.Error))
		}
	}

	fmt.Print("\n\n")
}

func printError(err error) {
	fmt.Println(red("❌ %s", err))
}

func printToolCallResponse(toolCall tools.ToolCall, response string) {
	fmt.Printf("\n%s\n", gray("%s response%s", bold(toolCall.Function.Name), formatToolCallResponse(response)))
}

func printToolCall(toolCall tools.ToolCall, colorFunc ...func(format string, a ...any) string) {
	c := gray
	if len(colorFunc) > 0 && colorFunc[0] != nil {
		c = colorFunc[0]
	}
	fmt.Printf("\n%s\n", c("%s%s", bold(toolCall.Function.Name), formatToolCallArguments(toolCall.Function.Arguments)))
}

func formatToolCallArguments(arguments string) string {
	if arguments == "" {
		return "()"
	}

	// Parse JSON to validate it and reformat
	var parsed any
	if err := json.Unmarshal([]byte(arguments), &parsed); err != nil {
		// If JSON parsing fails, return the original string
		return fmt.Sprintf("(%s)", arguments)
	}

	// Custom format that handles multiline strings better
	return formatParsedJSON(parsed)
}

func formatToolCallResponse(response string) string {
	if response == "" {
		return " → ()"
	}

	// For responses, we want to show them as readable text, not JSON
	// Check if it looks like JSON first
	var parsed any
	if err := json.Unmarshal([]byte(response), &parsed); err == nil {
		// It's valid JSON, format it nicely
		return " → " + formatParsedJSON(parsed)
	}

	// It's plain text, handle multiline content
	if strings.Contains(response, "\n") {
		// Trim whitespace and split into lines
		trimmed := strings.TrimSpace(response)
		lines := strings.Split(trimmed, "\n")

		if len(lines) <= 3 {
			// Short multiline, show inline
			return fmt.Sprintf(" → %q", response)
		}

		// Long multiline, format with line breaks
		// Process each line individually and collapse consecutive empty lines
		var formatted []string
		lastWasEmpty := false

		for _, line := range lines {
			trimmedLine := strings.TrimSpace(line)
			if trimmedLine == "" {
				// Empty line - only add one if the last line wasn't empty
				if !lastWasEmpty {
					formatted = append(formatted, "")
					lastWasEmpty = true
				}
			} else {
				formatted = append(formatted, line)
				lastWasEmpty = false
			}
		}
		return fmt.Sprintf(" → (\n%s\n)", strings.Join(formatted, "\n"))
	}

	// Single line text response
	return fmt.Sprintf(" → %q", response)
}

func formatParsedJSON(data any) string {
	switch v := data.(type) {
	case map[string]any:
		if len(v) == 0 {
			return "()"
		}

		parts := make([]string, 0, len(v))
		hasMultilineContent := false

		for key, value := range v {
			formatted := formatJSONValue(key, value)
			parts = append(parts, formatted)
			if strings.Contains(formatted, "\n") {
				hasMultilineContent = true
			}
		}

		if len(parts) == 1 && !hasMultilineContent {
			return fmt.Sprintf("(%s)", parts[0])
		}

		return fmt.Sprintf("(\n  %s\n)", strings.Join(parts, "\n  "))

	default:
		// For non-object types, use standard JSON formatting
		formatted, _ := json.MarshalIndent(data, "", "  ")
		return fmt.Sprintf("(%s)", string(formatted))
	}
}

func formatJSONValue(key string, value any) string {
	switch v := value.(type) {
	case string:
		// Handle multiline strings by displaying with actual newlines
		if strings.Contains(v, "\n") {
			// Format as: key: "content with
			// actual line breaks"
			return fmt.Sprintf("%s: %q", bold(key), v)
		}
		// Regular string with proper escaping
		return fmt.Sprintf("%s: %q", bold(key), v)

	case []any:
		if len(v) == 0 {
			return fmt.Sprintf("%s: []", bold(key))
		}
		// Show full array contents
		jsonBytes, _ := json.MarshalIndent(v, "", "  ")
		return fmt.Sprintf("%s: %s", bold(key), string(jsonBytes))

	case map[string]any:
		jsonBytes, _ := json.MarshalIndent(v, "", "  ")
		return fmt.Sprintf("%s: %s", bold(key), string(jsonBytes))

	default:
		jsonBytes, _ := json.Marshal(v)
		return fmt.Sprintf("%s: %s", bold(key), string(jsonBytes))
	}
}

func trimString(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max]
}
