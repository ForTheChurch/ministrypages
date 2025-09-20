package routes

import (
	"github.com/ForTheChurch/buildforthechurch/cmd/api/handlers"
	"github.com/ForTheChurch/buildforthechurch/cmd/api/services"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r gin.IRouter, services *services.Services) {
	r.GET("/_health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	pageHandler := handlers.NewPageHandler(services)
	pageGroup := r.Group("/pages")

	pageGroup.POST("/convert-single-page", pageHandler.ConvertSinglePage)
	// TODO dedupe this endpoint
	pageGroup.GET("/task/:id", pageHandler.GetTaskStatus)

	postHandler := handlers.NewPostHandler(services)
	postGroup := r.Group("/posts")

	postGroup.POST("/apply-youtube-transcript", postHandler.ApplyYoutubeTranscript)
	// TODO dedupe this endpoint
	postGroup.GET("/task/:id", pageHandler.GetTaskStatus)
}
