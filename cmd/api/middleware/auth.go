package middleware

import (
	"log"

	"github.com/ForTheChurch/buildforthechurch/cmd/api/config"
	"github.com/gin-gonic/gin"
)

func Auth(cfg config.Config) gin.HandlerFunc {
	if cfg.AgentAPIKey == "" {
		log.Fatal("AGENT_API_KEY is not set")
	}
	return func(c *gin.Context) {
		token := c.GetHeader("X-Agent-API-Key")
		if token == cfg.AgentAPIKey {
			c.Next()
			return
		}

		c.JSON(401, gin.H{"error": "Unauthorized"})
		c.Abort()
	}
}
