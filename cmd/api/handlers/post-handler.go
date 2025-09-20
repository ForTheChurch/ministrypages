package handlers

import (
	"strings"

	"github.com/ForTheChurch/buildforthechurch/cmd/api/services"
	agenttask "github.com/ForTheChurch/buildforthechurch/internal/agent-task"
	agenttaskmanager "github.com/ForTheChurch/buildforthechurch/internal/agent-task-manager"
	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	services *services.Services
}

func NewPostHandler(services *services.Services) *PostHandler {
	return &PostHandler{services: services}
}

func (h *PostHandler) ApplyYoutubeTranscript(c *gin.Context) {
	type params struct {
		URL    string `json:"url" binding:"required"`
		PostID string `json:"postId" binding:"required"`
	}

	var p params
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if !strings.HasPrefix(p.URL, "https://youtu.be") && !strings.HasPrefix(p.URL, "https://www.youtube.com/watch") {
		c.JSON(400, gin.H{"error": "Not a YouTube URL"})
		return
	}

	id, err := h.services.GetAgentTaskManager().QueueTask(agenttask.NewYoutubeTranscriptTask(
		p.URL, p.PostID, h.services.GetScraper(), h.services.GetPayloadCMSClient(), h.services.GetLLM()))
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"task_status": agenttaskmanager.TaskStatusQueued, "task_id": id})
}
