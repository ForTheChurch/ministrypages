package prompt

import (
	"bytes"
	"embed"
	"path/filepath"
	"text/template"
)

//go:embed prompts/*
var promptsFS embed.FS

type ConvertPageTemplate struct {
	TypeScriptFile string
}

func GetConvertPagePrompt() (string, error) {
	pageTypes, err := promptsFS.ReadFile(filepath.Join("prompts", "page-types.ts"))
	if err != nil {
		return "", err
	}

	tmpl, err := template.ParseFS(promptsFS, filepath.Join("prompts", "convert-page.md"))
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
