import { Card, CardContent } from '@/components/ui/card'
import { Page } from '@/payload-types'
import { makeAssistantToolUI } from '@assistant-ui/react'
import {
  CheckIcon,
  ExternalLinkIcon,
  Loader2Icon,
  SearchCheckIcon,
  SearchXIcon,
  XIcon,
} from 'lucide-react'

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
        <i>{result?.title || result?.slug}</i> page
      </ToolWrapper>
    )
  },
})

export const UpdatePageToolUI = makeAssistantToolUI<
  {
    pageId: string
    page: string
  },
  | {
      message: string
      previewUrl: string
    }
  | ErrorResult
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
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <CheckIcon className="text-green-600" />{' '}
            <span dangerouslySetInnerHTML={{ __html: result?.message || '' }} />
          </div>
          <a href={result?.previewUrl} target="_blank" rel="noopener noreferrer">
            Click here to preview the page <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </div>
      </ToolWrapper>
    )
  },
})

export const PublishPageToolUI = makeAssistantToolUI<
  {
    pageId: string
    page: string
  },
  | {
      message: string
      publishedUrl: string
    }
  | ErrorResult
>({
  toolName: 'publishPage',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Publishing page...
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to publish page</div>
            </div>
            <div className="text-gray-500">Error: {result?.error}</div>
          </div>
        </ToolWrapper>
      )
    }

    return (
      <ToolWrapper>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <CheckIcon className="text-green-600" />{' '}
            <span dangerouslySetInnerHTML={{ __html: result?.message || '' }} />
          </div>
          <a href={result?.publishedUrl} target="_blank" rel="noopener noreferrer">
            Click here see the published page <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </div>
      </ToolWrapper>
    )
  },
})

export const CreatePageToolUI = makeAssistantToolUI<
  {
    page: string
  },
  | {
      message: string
      pageId: string
      previewUrl: string
    }
  | ErrorResult
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
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <CheckIcon className="text-green-600" />{' '}
            <span dangerouslySetInnerHTML={{ __html: result?.message || '' }} />
          </div>
          <a href={result?.previewUrl} target="_blank" rel="noopener noreferrer">
            Click here to preview the page <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </div>
      </ToolWrapper>
    )
  },
})

export const DeletePageToolUI = makeAssistantToolUI<
  {
    page: string
  },
  | {
      message: string
    }
  | ErrorResult
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

export const GetNavigationItemsToolUI = makeAssistantToolUI<
  void,
  | {
      navItems?: unknown[]
    }
  | ErrorResult
>({
  toolName: 'getNavigationItems',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Getting site navigation...
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to get site navigation</div>
            </div>
            <div className="text-gray-500">Error: {result?.error}</div>
          </div>
        </ToolWrapper>
      )
    }

    return (
      <ToolWrapper>
        <CheckIcon className="text-green-600" /> Found {result?.navItems?.length ?? 0} navigation
        items
      </ToolWrapper>
    )
  },
})

export const AddNavigationItemToolUI = makeAssistantToolUI<
  {
    pageId: string
    position: number
  },
  | {
      message: string
    }
  | ErrorResult
>({
  toolName: 'addNavigationItem',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Adding navigation item...
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to add navigation item</div>
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

export const RemoveNavigationItemToolUI = makeAssistantToolUI<
  {
    navItemId: string
  },
  | {
      message: string
    }
  | ErrorResult
>({
  toolName: 'removeNavigationItem',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Removing navigation item...
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to remove navigation item</div>
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

export const CreateFormToolUI = makeAssistantToolUI<
  {
    form: string
  },
  | {
      message: string
      formId: string
    }
  | ErrorResult
>({
  toolName: 'createForm',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Creating form...
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to create form</div>
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

export const GetEventsToolUI = makeAssistantToolUI<
  void,
  | Array<{
      id: string
    }>
  | ErrorResult
>({
  toolName: 'getEvents',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Getting events...
        </ToolWrapper>
      )
    }

    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to get events</div>
            </div>
            <div className="text-gray-500">Error: {result?.error}</div>
          </div>
        </ToolWrapper>
      )
    }

    return (
      <ToolWrapper>
        <CheckIcon className="text-green-600" /> Found {result?.length ?? 0} events
      </ToolWrapper>
    )
  },
})

export const GetEventContentToolUI = makeAssistantToolUI<
  { eventId: string },
  | {
      id: string
      title: string
    }
  | ErrorResult
>({
  toolName: 'getEventContent',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Getting event content...
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to get event content</div>
            </div>
            <div className="text-gray-500">Error: {result?.error}</div>
          </div>
        </ToolWrapper>
      )
    }

    return (
      <ToolWrapper>
        <CheckIcon className="text-green-600" /> Retrieved content for <i>{result?.title}</i> event
      </ToolWrapper>
    )
  },
})

export const CreateEventToolUI = makeAssistantToolUI<
  { event: string },
  | {
      message: string
      eventId: string
    }
  | ErrorResult
>({
  toolName: 'createEvent',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Creating event...
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to create event</div>
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

export const UpdateEventToolUI = makeAssistantToolUI<
  { eventId: string; event: string },
  | {
      message: string
    }
  | ErrorResult
>({
  toolName: 'updateEvent',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Updating event...
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to update event</div>
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

export const DeleteEventToolUI = makeAssistantToolUI<
  { eventId: string },
  | {
      message: string
    }
  | ErrorResult
>({
  toolName: 'deleteEvent',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Deleting event...
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to delete event</div>
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

export const PublishEventToolUI = makeAssistantToolUI<
  { eventId: string },
  | {
      message: string
    }
  | ErrorResult
>({
  toolName: 'publishEvent',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Publishing event...
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to publish event</div>
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

export const SearchSermonPostsToolUI = makeAssistantToolUI<
  { query: string },
  | Array<{
      id: string
      title: string
      slug: string
      publishedAt: string
      updatedAt: string
      createdAt: string
    }>
  | ErrorResult
>({
  toolName: 'searchSermonPosts',
  render: ({ args, result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <Loader2Icon className="animate-spin text-blue-600" /> Searching sermon posts...
            </div>
            <div className="text-gray-500">Searching for: {args.query}</div>
          </div>
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to search sermon posts</div>
            </div>
            <div className="text-gray-500">Error: {result?.error}</div>
          </div>
        </ToolWrapper>
      )
    }

    return (
      <ToolWrapper>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            {result?.length && result.length > 0 ? (
              <SearchCheckIcon className="text-green-600" />
            ) : (
              <SearchXIcon className="text-gray-600" />
            )}{' '}
            Found {result?.length ?? 0} sermon posts
          </div>
          <div className="text-gray-500">
            <div className="text-gray-500">Searched for: {args.query}</div>
          </div>
        </div>
      </ToolWrapper>
    )
  },
})

export const GetSermonPostContentToolUI = makeAssistantToolUI<
  { postId: string },
  | {
      id: string
      title: string
      content: string
    }
  | ErrorResult
>({
  toolName: 'getSermonPostContent',
  render: ({ result, status }) => {
    if (status.type === 'running') {
      return (
        <ToolWrapper>
          <Loader2Icon className="animate-spin text-blue-600" /> Getting sermon post content...
        </ToolWrapper>
      )
    }
    if (isErrorResult(result)) {
      return (
        <ToolWrapper>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <XIcon className="text-red-500" />{' '}
              <div className="text-red-500">Failed to get sermon post content</div>
            </div>
            <div className="text-gray-500">Error: {result?.error}</div>
          </div>
        </ToolWrapper>
      )
    }

    return (
      <ToolWrapper>
        <CheckIcon className="text-green-600" /> Retrieved content for <i>{result?.title}</i>
      </ToolWrapper>
    )
  },
})
