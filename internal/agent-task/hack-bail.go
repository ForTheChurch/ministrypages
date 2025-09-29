package agenttask

import (
	"context"
	"os"

	"github.com/docker/cagent/pkg/tools"
)

// This is a hack around the Gloo API hanging
type bail struct {
	context context.Context
	cancel  context.CancelFunc
}

func newBail(ctx context.Context) (context.Context, *bail, func()) {
	newCtx, cancel := context.WithCancel(ctx)

	return newCtx, &bail{
		context: newCtx,
		cancel:  cancel,
	}, cancel
}

func (b *bail) BailAfterSuccessfulToolCall(tool tools.Tool) tools.Tool {
	// Only needed for Gloo
	if os.Getenv("USE_ANTHROPIC_API") == "true" {
		return tool
	}

	handler := tool.Handler
	tool.Handler = func(ctx context.Context, toolCall tools.ToolCall) (*tools.ToolCallResult, error) {
		result, err := handler(b.context, toolCall)
		if err != nil {
			// Don't bail if the tool call failed, might retry
			return result, err
		}
		defer b.cancel()
		return result, err
	}
	return tool
}
