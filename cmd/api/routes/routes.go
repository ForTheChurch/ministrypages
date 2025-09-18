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
	pageGroup.GET("/task/:id", pageHandler.GetTaskStatus)
}
