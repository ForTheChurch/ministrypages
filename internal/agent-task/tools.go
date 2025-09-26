package agenttask

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/ForTheChurch/buildforthechurch/internal/payloadcms"
	"github.com/docker/cagent/pkg/tools"
)

func toolUploadMedia(logTask string, payloadCMSClient *payloadcms.Client) tools.Tool {
	return tools.Tool{
		Handler: func(ctx context.Context, toolCall tools.ToolCall) (*tools.ToolCallResult, error) {
			log.Println("[" + logTask + "] Upload media tool called")

			type params struct {
				URL string `json:"url"`
			}
			var p params
			if err := json.Unmarshal([]byte(toolCall.Function.Arguments), &p); err != nil {
				return nil, err
			}

			log.Println("["+logTask+"] Uploading media from", p.URL)

			filename, err := getMediaFilename(p.URL)
			if err != nil {
				return nil, fmt.Errorf("error getting media filename: %w", err)
			}

			media, err := downloadMedia(ctx, p.URL)
			if err != nil {
				return nil, fmt.Errorf("error downloading media: %w", err)
			}

			id, err := payloadCMSClient.UploadMedia(ctx, filename, media)
			if err != nil {
				return nil, fmt.Errorf("error uploading media: %w", err)
			}

			return &tools.ToolCallResult{
				Output: "Media uploaded successfully. Media ID: " + id,
			}, nil
		},
		Function: &tools.FunctionDefinition{
			Name:        "upload-media",
			Description: "Upload a media file to the CMS (picture, video, audio, etc.)",
			Parameters: tools.FunctionParamaters{
				Type: "object",
				Properties: map[string]any{
					"url": map[string]any{
						"type":        "string",
						"description": "The URL of the media file to upload",
					},
				},
				Required: []string{"url"},
			},
		},
	}
}

func toolExportPage(logTask string, pageID string, payloadCMSClient *payloadcms.Client) tools.Tool {
	return tools.Tool{
		Handler: func(ctx context.Context, toolCall tools.ToolCall) (*tools.ToolCallResult, error) {
			log.Println("[" + logTask + "] Export page tool called")

			_ = os.MkdirAll("output", 0755)
			// Write the page JSON to a file for debugging
			_ = os.WriteFile(filepath.Join("output", "generated-page-"+pageID+".json"), []byte(toolCall.Function.Arguments), 0644)

			type params struct {
				PageJSON string `json:"pageJSON"`
			}
			var p params
			if err := json.Unmarshal([]byte(toolCall.Function.Arguments), &p); err != nil {
				return nil, err
			}

			var pageData payloadcms.PagePatch
			if err := json.Unmarshal([]byte(p.PageJSON), &pageData); err != nil {
				return nil, err
			}

			pageData.ID = pageID

			log.Println("[" + logTask + "] Patching page produced by agent")

			if err := payloadCMSClient.UpdatePage(ctx, pageData); err != nil {
				log.Println("["+logTask+"] Error patching page:", err)
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
						"type":        "string",
						"description": "The JSON object representing the page",
					},
				},
				Required: []string{"pageJSON"},
			},
		},
	}
}

func toolExportMarkdown(logTask string, postId string, payloadCMSClient *payloadcms.Client) tools.Tool {
	return tools.Tool{
		Handler: func(ctx context.Context, toolCall tools.ToolCall) (*tools.ToolCallResult, error) {
			log.Println("[" + logTask + "] Export markdown tool called")
			type params struct {
				Markdown string `json:"markdown"`
			}
			var p params
			if err := json.Unmarshal([]byte(toolCall.Function.Arguments), &p); err != nil {
				return nil, err
			}

			// Debugging output
			if err := os.WriteFile(filepath.Join("output", "generated-transcript.md"), []byte(p.Markdown), 0644); err != nil {
				return nil, err
			}

			if err := payloadCMSClient.UpdatePostMarkdown(ctx, postId, p.Markdown); err != nil {
				log.Println("["+logTask+"] Error updating post markdown:", err)
				return nil, err
			}

			return &tools.ToolCallResult{
				Output: "Markdown exported successfully",
			}, nil
		},
		Function: &tools.FunctionDefinition{
			Name:        "export-markdown",
			Description: "Export the transcript into formatted markdown",
			Parameters: tools.FunctionParamaters{
				Type: "object",
				Properties: map[string]any{
					"markdown": map[string]any{
						"type":        "string",
						"description": "The markdown content",
					},
				},
				Required: []string{"markdown"},
			},
		},
	}
}
