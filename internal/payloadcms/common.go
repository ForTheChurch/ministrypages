package payloadcms

import "strings"

type Response struct {
	Errors Errors `json:"errors,omitempty"`
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
