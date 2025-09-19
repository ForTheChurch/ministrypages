package payloadcms

type MediaResponse struct {
	Response
	Doc *MediaDocument `json:"doc,omitempty"`
}

type MediaDocument struct {
	ID  string `json:"id"`
	Url string `json:"url"`
}
