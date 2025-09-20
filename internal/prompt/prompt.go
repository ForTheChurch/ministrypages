package prompt

import (
	"bytes"
	"embed"
	"path"
	"text/template"
)

//go:embed prompts/*
var promptsFS embed.FS

type ConvertPageTemplate struct {
	TypeScriptFile string
}

func GetConvertPagePrompt() (string, error) {
	pageTypes, err := promptsFS.ReadFile(path.Join("prompts", "page-types.ts"))
	if err != nil {
		return "", err
	}

	tmpl, err := template.ParseFS(promptsFS, path.Join("prompts", "convert-page.md"))
	if err != nil {
		return "", err
	}

	data := ConvertPageTemplate{
		TypeScriptFile: string(pageTypes),
	}

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, data)
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}

func GetYoutubeTranscriptPrompt() (string, error) {
	file, err := promptsFS.Open(path.Join("prompts", "youtube-transcript.md"))
	if err != nil {
		return "", err
	}
	defer file.Close()

	var buf bytes.Buffer
	_, err = buf.ReadFrom(file)
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}
