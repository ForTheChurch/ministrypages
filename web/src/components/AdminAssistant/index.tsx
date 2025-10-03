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
import './styles.css'

const AdminAssistant: React.FC = () => {
  const runtime = useChatRuntime({})

  return (
    <div className="admin-assistant-container mb-6 p-6 m-1 border-solid border-gray-200 shadow-sm rounded-lg">
      <div className="py-6">
        <h2 className="dashboard__label">Content Assistant</h2>
        <p className="mt-1">
          Get help with content creation, page management, and website updates.
        </p>
      </div>
      <div>
        <AssistantRuntimeProvider runtime={runtime}>
          <GetPagesToolUI />
          <GetPageContentToolUI />
          <UpdatePageToolUI />
          <CreatePageToolUI />
          <DeletePageToolUI />
          <TooltipProvider>
            <div className="grid h-[500px] lg:grid-cols-[200px_1fr] gap-6">
              <div className="border border-gray-200 rounded-lg">
                <ThreadList />
              </div>
              <div className="border border-gray-200 h-300 lg:h-[500px] overflow-y-auto rounded-lg">
                <Thread />
              </div>
            </div>
          </TooltipProvider>
        </AssistantRuntimeProvider>
      </div>
    </div>
  )
}

export default AdminAssistant
