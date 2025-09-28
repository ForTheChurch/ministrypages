// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import path from 'path'
import { buildConfig, PayloadRequest, WorkflowConfig } from 'payload'
import sharp from 'sharp' // sharp-import
import { fileURLToPath } from 'url'

import { defaultLexical } from '@/fields/defaultLexical'
import { Church } from './Church/config'
import { Categories } from './collections/Categories'
import { Events } from './collections/Events'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Series } from './collections/Series'
import { SinglePageConversions } from './collections/SinglePageConversions'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { Logo } from './Logo/config'
import { plugins } from './plugins'
import agentApi from './utilities/agentApi'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: ' - ForTheChurch Admin',
      icons: {
        icon: '/favicon.svg',
      },
    },

    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: [],
      graphics: {
        Logo: '@/graphics/Logo',
        Icon: '@/graphics/Logo',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  collections: [Pages, Media, Posts, Events, Series, Categories, Users, SinglePageConversions],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Church, Logo, Header, Footer],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    // This exposes the Jobs collection in the Admin panel
    jobsCollectionOverrides: ({ defaultJobsCollection }) => {
      if (!defaultJobsCollection.admin) {
        defaultJobsCollection.admin = {}
      }

      defaultJobsCollection.admin.hidden = false
      return defaultJobsCollection
    },
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [
      {
        // This task is for initiating a single page conversion via the agent
        // backend.
        retries: 2,
        slug: 'beginSinglePageConversion',
        inputSchema: [
          {
            name: 'documentId',
            type: 'text',
            required: true,
          },
          {
            name: 'url',
            type: 'text',
            required: true,
          },
        ],
        outputSchema: [
          {
            name: 'singlePageConversionId',
            type: 'text',
            required: true,
          },
        ],
        // TODO: Move handler to a separate file
        // https://payloadcms.com/docs/jobs-queue/tasks#defining-tasks-in-the-config
        handler: async ({
          input,
          job,
          req,
        }: {
          input: { documentId: string; url: string }
          job: any
          req: any
        }) => {
          const { documentId, url } = input

          const activeTaskCountForPage = await req.payload.count({
            collection: 'single-page-conversions',
            where: {
              pageId: { equals: documentId },
              agentTaskStatus: { in: ['queued', 'running'] },
            },
          })

          if (activeTaskCountForPage > 0) {
            throw new Error(
              '[beginSinglePageConversion] Cannot start a new conversion when an existing conversion is active.',
            )
          }

          // TODO: Don't hardcode
          const response = await agentApi.post('/pages/convert-single-page', {
            url,
            pageId: documentId,
          })
          const { task_id: agentTaskId, task_status: agentTaskStatus } = response.data

          const singlePageConversion = await req.payload.create({
            collection: 'single-page-conversions',
            data: {
              pageId: documentId,
              agentTaskId,
              agentTaskStatus,
            },
          })

          return {
            output: { singlePageConversionId: singlePageConversion?.id },
          }
        },
        onFail: async () => {
          console.error("Job 'beginSinglePageConversion' failed")
        },
        onSuccess: async () => {
          console.log("Job 'beginSinglePageConversion' succeeded")
        },
      },
      {
        // This task returns success when the given task is complete
        retries: 9999,
        slug: 'waitForAgentTask',
        inputSchema: [
          {
            name: 'singlePageConversionId',
            type: 'text',
            required: true,
          },
        ],
        outputSchema: [
          {
            name: 'status',
            type: 'text',
            required: true,
          },
        ],
        handler: async ({
          input,
          job,
          req,
        }: {
          input: { singlePageConversionId: string }
          job: any
          req: any
        }) => {
          const { singlePageConversionId } = input

          const singlePageConversion = await req.payload.findByID({
            collection: 'single-page-conversions',
            id: singlePageConversionId,
          })
          const { agentTaskId } = singlePageConversion

          if (!singlePageConversion) {
            throw new Error(
              `Cannot find single page conversion with ID [${singlePageConversionId}]`,
            )
          }

          // Configure a timeout on the polling for safety
          const timeoutMs = 300000
          const endTime = Date.now() + timeoutMs
          while (true) {
            // TODO: Don't hardcode
            const response = await agentApi.get(`/pages/task/${agentTaskId}`)

            const { task_status: agentTaskStatus } = response.data

            // Update the task status in the document
            await req.payload.update({
              collection: 'single-page-conversions',
              id: singlePageConversionId,
              data: { agentTaskStatus },
            })

            // Status schema:
            // {
            //   "task_status": "queued" | "running" | "completed" | "failed"
            // }
            if (agentTaskStatus == 'completed' || agentTaskStatus == 'failed') {
              return {
                output: { status: agentTaskStatus },
              }
            }

            // Timeout
            if (Date.now() >= endTime) {
              throw new Error('[waitForAgentTask] Timed out')
            }
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        },
        onFail: async () => {
          console.error("Job 'waitForAgentTask' failed")
        },
        onSuccess: async () => {
          console.log("Job 'waitForAgentTask' succeeded")
        },
      },
    ],
    workflows: [
      {
        slug: 'convertSinglePage',
        inputSchema: [
          {
            name: 'documentId',
            type: 'text',
            required: true,
          },
          {
            name: 'url',
            type: 'text',
            required: true,
          },
        ],
        handler: async ({ job, tasks }) => {
          // Begin the conversion and get a task ID
          const taskIdConvertSinglePage = '1'
          const { singlePageConversionId } = await tasks.beginSinglePageConversion(
            taskIdConvertSinglePage,
            {
              input: {
                documentId: job.input.documentId,
                url: job.input.url,
              },
            },
          )

          // Wait on the task to complete
          const taskIdWaitForAgentTask = '2'
          const { status } = await tasks.waitForAgentTask(taskIdWaitForAgentTask, {
            input: { singlePageConversionId },
          })
        },
      } as WorkflowConfig<'convertSinglePage'>,
    ],
  },
  endpoints: [
    {
      // This endpoint is for creating jobs via the REST API
      path: '/begin-single-page-conversion',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        if (!req.json) {
          throw new Error('[/begin-single-page-conversion] Request has no JSON method')
        }

        const body = await req.json()
        const { task, workflow, data } = body
        const { documentId, url }: { documentId: string; url: string } = data

        if (task && workflow) {
          throw new Error('[/begin-single-page-conversion] Cannot queue both a task and a workflow')
        }

        const job = await req.payload.jobs.queue({
          task,
          workflow,
          input: {
            documentId,
            url,
          },
        })

        // Schedule the job to start asynchronously
        setImmediate(async () => {
          try {
            await req.payload.jobs.runByID({ id: job.id })
          } catch (error) {
            console.error(`[/begin-single-page-conversion] Job '${job.id}' failed:`, error)
          }
        })

        return Response.json(
          { message: `Job created. Job ID: ${job.id}, URL: ${url}` },
          { status: 201 },
        )
      },
    },
  ],
})
