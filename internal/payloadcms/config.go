package payloadcms

type Config struct {
	BaseURL string `env:"PAYLOAD_BASE_URL,required"`
	APIKey  string `env:"PAYLOAD_API_KEY,required"`
}
