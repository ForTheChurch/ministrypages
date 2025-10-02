'use client'

import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/react-ai-sdk'
import { Thread } from '@/components/assistant-ui/thread'
import { ThreadList } from '@/components/assistant-ui/thread-list'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  CreatePageToolUI,
  DeletePageToolUI,
  GetPageContentToolUI,
  GetPagesToolUI,
  UpdatePageToolUI,
} from './tools'

export default function AssistantPage() {
  const runtime = useChatRuntime({})

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <GetPagesToolUI />
      <GetPageContentToolUI />
      <UpdatePageToolUI />
      <CreatePageToolUI />
      <DeletePageToolUI />
      <TooltipProvider>
        <div className="grid h-dvh grid-cols-[200px_1fr] gap-x-2 px-4 py-4">
          <ThreadList />
          <Thread />
        </div>
      </TooltipProvider>
    </AssistantRuntimeProvider>
  )
}
