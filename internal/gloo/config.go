package gloo

type Config struct {
	ClientID     string `env:"GLOO_CLIENT_ID,required"`
	ClientSecret string `env:"GLOO_CLIENT_SECRET,required"`
}
