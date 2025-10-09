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
  ImportExternalWebPageToolUI,
  ImportYoutubeSermonToolUI,
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
import {
  AssistantRuntimeProvider,
  CompositeAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/react-ai-sdk'
import './styles.css'
import { MediaUploadAttachmentAdapter } from './attachments'

const AdminAssistant: React.FC = () => {
  const compositeAdapter = new CompositeAttachmentAdapter([
    new MediaUploadAttachmentAdapter(),
    new SimpleTextAttachmentAdapter(),
  ])
  const runtime = useChatRuntime({
    adapters: {
      attachments: compositeAdapter,
    },
  })

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
          <ImportExternalWebPageToolUI />
          <ImportYoutubeSermonToolUI />
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
