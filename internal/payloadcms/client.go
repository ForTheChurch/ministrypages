package payloadcms

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"path/filepath"
)

type Client struct {
	cfg    Config
	client *http.Client
}

func NewClient(cfg Config, client *http.Client) *Client {
	return &Client{cfg: cfg, client: client}
}

func (c *Client) UpdatePage(ctx context.Context, page PagePatch) error {
	jsonBody, err := json.Marshal(page)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, "PATCH", c.cfg.BaseURL+"/api/pages/"+page.ID, bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "users API-Key "+c.cfg.APIKey)

	resp, err := c.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var response Response
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return err
	}
	if len(response.Errors) > 0 {
		return response.Errors
	}

	return nil
}

func (c *Client) UploadMedia(ctx context.Context, filename string, media []byte) (string, error) {
	var b bytes.Buffer
	w := multipart.NewWriter(&b)

	mimeType := mime.TypeByExtension(filepath.Ext(filename))
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	h := make(textproto.MIMEHeader)
	h.Set("Content-Disposition", multipart.FileContentDisposition("file", filename))
	h.Set("Content-Type", mimeType)
	fw, err := w.CreatePart(h)
	if err != nil {
		return "", fmt.Errorf("create file part: %w", err)
	}

	_, err = io.Copy(fw, bytes.NewReader(media))
	if err != nil {
		return "", fmt.Errorf("copy media: %w", err)
	}

	w.Close()

	req, err := http.NewRequestWithContext(ctx, "POST", c.cfg.BaseURL+"/api/media", &b)
	if err != nil {
		return "", fmt.Errorf("new request: %w", err)
	}

	req.Header.Set("Content-Type", w.FormDataContentType())
	req.Header.Set("Authorization", "users API-Key "+c.cfg.APIKey)

	resp, err := c.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	var response MediaResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("decode response: %w", err)
	}

	if len(response.Errors) > 0 {
		return "", response.Errors
	}

	if response.Doc == nil {
		return "", fmt.Errorf("no document returned")
	}

	return response.Doc.ID, nil
}
