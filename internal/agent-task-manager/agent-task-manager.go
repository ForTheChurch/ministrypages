package agentmanager

import (
	"context"
	"errors"
	"log"
	"sync"
	"sync/atomic"

	agenttask "github.com/ForTheChurch/buildforthechurch/internal/agent-task"
)

type TaskStatus string

// Task status constants - these must match the frontend types
// Frontend also includes 'idle' status for when no task is active
const (
	TaskStatusQueued    TaskStatus = "queued"
	TaskStatusRunning   TaskStatus = "running"
	TaskStatusCompleted TaskStatus = "completed"
	TaskStatusFailed    TaskStatus = "failed"
)

type AgentTaskManager struct {
	taskQueue   chan agenttask.AgentTask
	finished    atomic.Bool
	parallelism int

	// TODO Use a persistent store for task status
	taskStatus map[string]TaskStatus
	mu         sync.RWMutex
}

func New() *AgentTaskManager {
	am := &AgentTaskManager{
		taskQueue:   make(chan agenttask.AgentTask, 64),
		taskStatus:  make(map[string]TaskStatus),
		parallelism: 4,
	}

	am.finished.Store(false)
	return am
}

func (a *AgentTaskManager) QueueTask(task agenttask.AgentTask) (string, error) {
	if a.finished.Load() {
		return "", errors.New("application is shutting down")
	}

	a.mu.Lock()
	a.taskStatus[task.ID()] = TaskStatusQueued
	a.mu.Unlock()

	a.taskQueue <- task
	return task.ID(), nil
}

func (a *AgentTaskManager) GetTaskStatus(id string) (TaskStatus, bool) {
	a.mu.RLock()
	defer a.mu.RUnlock()
	status, ok := a.taskStatus[id]
	return status, ok
}

func (a *AgentTaskManager) Start(ctx context.Context) {
	for i := 0; i < a.parallelism; i++ {
		go a.run(ctx)
	}
}

func (a *AgentTaskManager) run(ctx context.Context) {
	for {
		select {
		case task := <-a.taskQueue:
			a.mu.Lock()
			a.taskStatus[task.ID()] = TaskStatusRunning
			a.mu.Unlock()

			if err := task.Execute(ctx); err != nil {
				// TODO retry task
				a.mu.Lock()
				a.taskStatus[task.ID()] = TaskStatusFailed
				a.mu.Unlock()

				log.Println("Error executing task:", err)
			} else {
				a.mu.Lock()
				a.taskStatus[task.ID()] = TaskStatusCompleted
				a.mu.Unlock()
			}
		case <-ctx.Done():
			a.finished.Store(true)
			return
		}
	}
}
