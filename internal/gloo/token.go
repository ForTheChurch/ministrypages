package gloo

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

func GetAccessToken(ctx context.Context, clientID, clientSecret string) (string, error) {
	auth := base64.StdEncoding.EncodeToString([]byte(clientID + ":" + clientSecret))

	data := url.Values{}
	data.Set("grant_type", "client_credentials")
	data.Set("scope", "api/access")

	req, err := http.NewRequestWithContext(ctx, "POST",
		"https://platform.ai.gloo.com/oauth2/token",
		strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Authorization", "Basic "+auth)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	// Check token expiration from JWT payload
	parts := strings.Split(result.AccessToken, ".")
	if len(parts) != 3 {
		return "", fmt.Errorf("invalid token format")
	}

	var payload struct {
		Exp int64 `json:"exp"`
	}

	payloadBytes, _ := base64.RawURLEncoding.DecodeString(parts[1])
	json.Unmarshal(payloadBytes, &payload)

	// expiration := time.Unix(payload.Exp, 0)

	return result.AccessToken, nil
}
