'use client'

import {
  AddNavigationItemToolUI,
  CreateEventToolUI,
  CreateFormToolUI,
  CreatePageToolUI,
  DeleteEventToolUI,
  DeletePageToolUI,
  GetEventContentToolUI,
  GetEventsToolUI,
  GetNavigationItemsToolUI,
  GetPageContentToolUI,
  GetPagesToolUI,
  GetSermonPostContentToolUI,
  PublishEventToolUI,
  PublishPageToolUI,
  RemoveNavigationItemToolUI,
  SearchSermonPostsToolUI,
  UpdateEventToolUI,
  UpdatePageToolUI,
  UploadImageFromUrlToolUI,
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
    <div className="admin-assistant-container mb-6 mt-4 p-6 border-solid border-gray-200 shadow-xs rounded-lg">
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
          <PublishPageToolUI />
          <GetNavigationItemsToolUI />
          <AddNavigationItemToolUI />
          <RemoveNavigationItemToolUI />
          <CreateFormToolUI />
          <GetEventsToolUI />
          <GetEventContentToolUI />
          <CreateEventToolUI />
          <UpdateEventToolUI />
          <DeleteEventToolUI />
          <PublishEventToolUI />
          <SearchSermonPostsToolUI />
          <GetSermonPostContentToolUI />
          <UploadImageFromUrlToolUI />
          <TooltipProvider>
            <div className="grid lg:grid-cols-[200px_1fr] gap-6">
              <div className="border border-gray-200 rounded-lg">
                <ThreadList />
              </div>
              <div className="border border-gray-200 rounded-lg">
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
