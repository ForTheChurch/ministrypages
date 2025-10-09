import { anthropic } from '@ai-sdk/anthropic'
import { frontendTools } from '@assistant-ui/react-ai-sdk'
import { convertToModelMessages, stepCountIs, streamText } from 'ai'
import { systemPrompt } from './prompt'
import { getPagesTool } from '@/assistant/tools/getPages'
import { getPageContentTool } from '@/assistant/tools/getPageContent'
import { updateChurchInfoTool } from '@/assistant/tools/updateChurchInfo'
import { updatePageTool } from '@/assistant/tools/updatePage'
import { createPageTool } from '@/assistant/tools/createPage'
import { deletePageTool } from '@/assistant/tools/deletePage'
import { publishPageTool } from '@/assistant/tools/publishPage'
import { getNavigationItemsTool } from '@/assistant/tools/getNavigationItems'
import { addNavigationItemTool } from '@/assistant/tools/addNavigationItem'
import { removeNavigationItemTool } from '@/assistant/tools/removeNavigationItem'
import { createFormTool } from '@/assistant/tools/createForm'
import { getEventsTool } from '@/assistant/tools/getEvents'
import { getEventContentTool } from '@/assistant/tools/getEventContent'
import { createEventTool } from '@/assistant/tools/createEvent'
import { deleteEventTool } from '@/assistant/tools/deleteEvent'
import { publishEventTool } from '@/assistant/tools/publishEvent'
import { updateEventTool } from '@/assistant/tools/updateEvent'
import { searchSermonPostsTool } from '@/assistant/tools/searchSermonPosts'
import { getSermonPostContentTool } from '@/assistant/tools/getSermonPostContent'
import { uploadImageFromUrlTool } from '@/assistant/tools/uploadImageFromUrl'
import { importExternalWebPageTool } from '@/assistant/tools/importExternalWebPage'
import { importYoutubeSermonTool } from '@/assistant/tools/importYoutubeSermon'

export const maxDuration = 500

export async function POST(req: Request) {
  const { messages, tools } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    messages: convertToModelMessages(messages),
    system: systemPrompt,
    stopWhen: stepCountIs(10),
    maxOutputTokens: 64000,
    tools: {
      ...frontendTools(tools),
      getPages: getPagesTool,
      getPageContent: getPageContentTool,
      updateChurchInfo: updateChurchInfoTool,
      updatePage: updatePageTool,
      createPage: createPageTool,
      deletePage: deletePageTool,
      publishPage: publishPageTool,
      getNavigationItems: getNavigationItemsTool,
      addNavigationItem: addNavigationItemTool,
      removeNavigationItem: removeNavigationItemTool,
      createForm: createFormTool,
      getEvents: getEventsTool,
      getEventContent: getEventContentTool,
      createEvent: createEventTool,
      deleteEvent: deleteEventTool,
      publishEvent: publishEventTool,
      updateEvent: updateEventTool,
      searchSermonPosts: searchSermonPostsTool,
      getSermonPostContent: getSermonPostContentTool,
      uploadImageFromUrl: uploadImageFromUrlTool,
      importExternalWebPage: importExternalWebPageTool,
      importYoutubeSermon: importYoutubeSermonTool,
      // add backend tools here
    },
  })

  return result.toUIMessageStreamResponse()
}
