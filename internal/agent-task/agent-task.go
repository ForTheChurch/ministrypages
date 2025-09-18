package agenttask

import (
	"context"

	"github.com/google/uuid"
)

type AgentTask interface {
	Execute(ctx context.Context) error
	ID() string
}

func newTaskId() string {
	return uuid.New().String()
}
