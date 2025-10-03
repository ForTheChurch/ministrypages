import { anthropic } from '@ai-sdk/anthropic'
import { frontendTools } from '@assistant-ui/react-ai-sdk'
import { convertToModelMessages, stepCountIs, streamText } from 'ai'
import {
  createPageTool,
  deletePageTool,
  getPageContentTool,
  getPagesTool,
  getSermonPostContentTool,
  publishPageTool,
  searchSermonPostsTool,
  updatePageTool,
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
      searchSermonPosts: searchSermonPostsTool,
      getSermonPostContent: getSermonPostContentTool,
      // add backend tools here
    },
  })

  return result.toUIMessageStreamResponse()
}
