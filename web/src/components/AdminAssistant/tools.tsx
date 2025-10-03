import { Card, CardContent } from '@/components/ui/card'
import { Page } from '@/payload-types'
import { makeAssistantToolUI } from '@assistant-ui/react'
import { CheckIcon, Loader2Icon, XIcon } from 'lucide-react'

function ToolWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Card className="my-4">
      <CardContent className="p-4 flex flex-row items-center gap-2">{children}</CardContent>
    </Card>
  )
}

type ErrorResult = {
  error: string
}

function isErrorResult(result: unknown): result is ErrorResult {
  return typeof result === 'object' && result !== null && 'error' in result
}

export const GetPagesToolUI = makeAssistantToolUI<
  void,
  | Array<{
      id: string
      title: string
      slug: string
      publishedAt: string
      updatedAt: string
      createdAt: string
      _status: string
    }>
  | ErrorResult
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
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to get website pages</div>
            </div>
            <div className="text-gray-500">Error: {result?.error}</div>
          </div>
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
  Page | ErrorResult
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
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to get page content</div>
            </div>
            <div className="text-gray-500">Error: {result?.error}</div>
          </div>
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
  } | ErrorResult
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
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to update page</div>
            </div>
            <div className="text-gray-500">Error: {result?.error}</div>
          </div>
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
  } | ErrorResult
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
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to create page</div>
            </div>
            <div className="text-gray-500">Error: {result?.error}</div>
          </div>
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
  } | ErrorResult
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
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to delete page</div>
            </div>
            <div className="text-gray-500">Error: {result?.error}</div>
          </div>
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
