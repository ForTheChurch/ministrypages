package handlers

import (
	"github.com/ForTheChurch/buildforthechurch/cmd/api/services"
	agenttask "github.com/ForTheChurch/buildforthechurch/internal/agent-task"
	agenttaskmanager "github.com/ForTheChurch/buildforthechurch/internal/agent-task-manager"
	"github.com/gin-gonic/gin"
)

type PageHandler struct {
	services *services.Services
}

func NewPageHandler(services *services.Services) *PageHandler {
	return &PageHandler{services: services}
}

func (h *PageHandler) ConvertSinglePage(c *gin.Context) {
	type params struct {
		URL    string `json:"url"`
		PageID string `json:"pageId"`
	}

	var p params
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	id, err := h.services.GetAgentTaskManager().QueueTask(agenttask.NewConvertPageTask(
		p.URL, p.PageID,
		h.services.GetScraper(), h.services.GetPayloadCMSClient(), h.services.GetLLM()))
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"task_status": agenttaskmanager.TaskStatusQueued, "task_id": id})
}

func (h *PageHandler) GetTaskStatus(c *gin.Context) {
	id := c.Param("id")
	status, ok := h.services.GetAgentTaskManager().GetTaskStatus(id)
	if !ok {
		c.JSON(404, gin.H{"error": "task not found"})
		return
	}
	c.JSON(200, gin.H{"task_status": status})
}
