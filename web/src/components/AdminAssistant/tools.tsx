import { makeAssistantToolUI } from '@assistant-ui/react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckIcon, Loader2Icon, XIcon } from 'lucide-react'
import { Page } from '@/payload-types'

function ToolWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Card className="my-4">
      <CardContent className="p-4 flex flex-row items-center gap-2">{children}</CardContent>
    </Card>
  )
}

export const GetPagesToolUI = makeAssistantToolUI<
  void,
  Array<{
    id: string
    title: string
    slug: string
    publishedAt: string
    updatedAt: string
    createdAt: string
    _status: string
  }>
>({
  toolName: 'getPages',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Getting Website pages...
        </ToolWrapper>
      )
    }
    if (status.type === 'incomplete' && status.reason === 'error') {
      return (
        <ToolWrapper>
          <XIcon className="text-red-500" />{' '}
          <div className="text-red-500">Failed to get website pages</div>
        </ToolWrapper>
      )
    }

    return (
      <ToolWrapper>
        <CheckIcon className="text-green-600" /> Found {result?.length ?? 0} pages
      </ToolWrapper>
    )
  },
})

export const GetPageContentToolUI = makeAssistantToolUI<
  {
    pageId: string
  },
  Page
>({
  toolName: 'getPageContent',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Getting page content...
        </ToolWrapper>
      )
    }
    if (status.type === 'incomplete' && status.reason === 'error') {
      return (
        <ToolWrapper>
          <XIcon className="text-red-500" />{' '}
          <div className="text-red-500">Failed to get page content</div>
        </ToolWrapper>
      )
    }

    return (
      <ToolWrapper>
        <CheckIcon className="text-green-600" /> Retrieved page content for{' '}
        <i>{result?.title || result?.slug}</i>
      </ToolWrapper>
    )
  },
})

export const UpdatePageToolUI = makeAssistantToolUI<
  {
    pageId: string
    page: string
  },
  {
    message: string
  }
>({
  toolName: 'updatePage',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Updating page...
        </ToolWrapper>
      )
    }
    if (status.type === 'incomplete' && status.reason === 'error') {
      return (
        <ToolWrapper>
          <XIcon className="text-red-500" />{' '}
          <div className="text-red-500">Failed to update page</div>
        </ToolWrapper>
      )
    }

    return (
      <ToolWrapper>
        <CheckIcon className="text-green-600" />{' '}
        <span dangerouslySetInnerHTML={{ __html: result?.message || '' }} />
      </ToolWrapper>
    )
  },
})

export const CreatePageToolUI = makeAssistantToolUI<
  {
    page: string
  },
  {
    message: string
  }
>({
  toolName: 'createPage',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Creating page...
        </ToolWrapper>
      )
    }
    if (status.type === 'incomplete' && status.reason === 'error') {
      return (
        <ToolWrapper>
          <XIcon className="text-red-500" />{' '}
          <div className="text-red-500">Failed to create page</div>
        </ToolWrapper>
      )
    }

    return (
      <ToolWrapper>
        <CheckIcon className="text-green-600" />{' '}
        <span dangerouslySetInnerHTML={{ __html: result?.message || '' }} />
      </ToolWrapper>
    )
  },
})

export const DeletePageToolUI = makeAssistantToolUI<
  {
    page: string
  },
  {
    message: string
  }
>({
  toolName: 'deletePage',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Deleting page...
        </ToolWrapper>
      )
    }
    if (status.type === 'incomplete' && status.reason === 'error') {
      return (
        <ToolWrapper>
          <XIcon className="text-red-500" />{' '}
          <div className="text-red-500">Failed to delete page</div>
        </ToolWrapper>
      )
    }

    return (
      <ToolWrapper>
        <CheckIcon className="text-green-600" />{' '}
        <span dangerouslySetInnerHTML={{ __html: result?.message || '' }} />
      </ToolWrapper>
    )
  },
})
