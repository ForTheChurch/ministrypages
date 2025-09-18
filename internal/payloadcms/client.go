package payloadcms

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

type Config struct {
	BaseURL string `env:"PAYLOAD_BASE_URL,required"`
	APIKey  string `env:"PAYLOAD_API_KEY,required"`
}

type Response struct {
	Errors Errors `json:"errors"`
}

type Errors []Error

type Error struct {
	Message string `json:"message"`
}

func (e Errors) Error() string {
	var errs []string
	for _, err := range e {
		errs = append(errs, err.Message)
	}
	return strings.Join(errs, ", ")
}

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
