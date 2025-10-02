'use client'

import {
  CreatePageToolUI,
  DeletePageToolUI,
  GetPageContentToolUI,
  GetPagesToolUI,
  UpdatePageToolUI,
} from '@/components/AdminAssistant/tools'
import { Thread } from '@/components/assistant-ui/thread'
import { ThreadList } from '@/components/assistant-ui/thread-list'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/react-ai-sdk'

const AdminAssistant: React.FC = () => {
  const runtime = useChatRuntime({})

  return (
    <div className="admin-assistant-container mb-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Content Assistant</h2>
          <p className="text-sm text-gray-600 mt-1">
            Get help with content creation, page management, and website updates.
          </p>
        </div>
        <div className="p-6">
          <AssistantRuntimeProvider runtime={runtime}>
            <GetPagesToolUI />
            <GetPageContentToolUI />
            <UpdatePageToolUI />
            <CreatePageToolUI />
            <DeletePageToolUI />
            <TooltipProvider>
              <div className="grid h-[500px] grid-cols-[200px_1fr] gap-x-4">
                <div className="border border-gray-200 rounded-lg">
                  <ThreadList />
                </div>
                <div className="border border-gray-200 h-[500px] overflow-y-auto rounded-lg">
                  <Thread />
                </div>
              </div>
            </TooltipProvider>
          </AssistantRuntimeProvider>
        </div>
      </div>
    </div>
  )
}

export default AdminAssistant
