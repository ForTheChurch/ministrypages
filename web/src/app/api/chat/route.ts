import { anthropic } from '@ai-sdk/anthropic'
import { frontendTools } from '@assistant-ui/react-ai-sdk'
import { convertToModelMessages, stepCountIs, streamText } from 'ai'
import {
  addNavigationItemTool,
  createEventTool,
  createFormTool,
  createPageTool,
  deleteEventTool,
  deletePageTool,
  getEventContentTool,
  getEventsTool,
  getNavigationItemsTool,
  getPageContentTool,
  getPagesTool,
  getSermonPostContentTool,
  importExternalWebPageTool,
  publishEventTool,
  publishPageTool,
  removeNavigationItemTool,
  searchSermonPostsTool,
  updateEventTool,
  updatePageTool,
  uploadImageFromUrlTool,
} from './tools'
import { systemPrompt } from './prompt'

export const maxDuration = 30

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
      // add backend tools here
    },
  })

  return result.toUIMessageStreamResponse()
}
