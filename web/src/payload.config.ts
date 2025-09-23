// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import path from 'path'
import { buildConfig, PayloadRequest, WorkflowConfig } from 'payload'
import sharp from 'sharp' // sharp-import
import { fileURLToPath } from 'url'
import axios from 'axios'

import { defaultLexical } from '@/fields/defaultLexical'
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
  globals: [Logo, Header, Footer],
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
            required: true
          },
          {
            name: 'url',
            type: 'text',
            required: true,
          },
        ],
        outputSchema: [
          {
            name: 'agentTaskId',
            type: 'text',
            required: true,
          }
        ],
        // TODO: Move handler to a separate file
        // https://payloadcms.com/docs/jobs-queue/tasks#defining-tasks-in-the-config
        handler: async ({ input, job, req }: { input: { documentId: string, url: string }, job: any, req: any }) => {
          const { documentId, url } = input;

          console.log(`Running task 'beginSinglePageConversion' for document ID '${documentId}' and URL '${url}'`)

          // TODO: Handle case where existing conversion task is in progress
          // TODO: Don't hardcode
          const response = await axios.post("http://localhost:3005/api/pages/convert-single-page",
            {
              url,
              pageId: documentId
            });
          const { task_id: agentTaskId, task_status: agentTaskStatus } = response.data;

          await req.payload.create({
            collection: "single-page-conversions",
            id: documentId,
            data: {
              pageId: documentId,
              agentTaskId,
              agentTaskStatus
            }
          });

          return {
            output: { agentTaskId }
          };
        },
        onFail: async () => {
          console.error("Job 'beginSinglePageConversion' failed");
        },
        onSuccess: async () => {
          console.log("Job 'beginSinglePageConversion' succeeded");
        },
      },
      {
        // This task returns success when the given task is complete
        retries: 9999,
        slug: 'checkAgentTaskStatus',
        inputSchema: [
          {
            name: 'agentTaskId',
            type: 'text',
            required: true
          }
        ],
        outputSchema: [
          {
            name: 'status',
            type: 'text',
            required: true,
          }
        ],
        handler: async ({ input, job, req }: { input: { agentTaskId: string }, job: any, req: any }) => {
          const { agentTaskId } = input;

          console.log(`[checkAgentTaskStatus] Checking status of task ID '${agentTaskId}'`);

          const timeoutMs = 300000;
          const endTime = Date.now() + timeoutMs;
          while (true) {
            // TODO: Don't hardcode
            const response = await axios.get(`http://localhost:3005/api/pages/task/${agentTaskId}`);
            const { task_status: agentTaskStatus } = response.data;
            console.log("[checkAgentStatus] status:", agentTaskStatus);

            // Update the task status in the document
            req.payload.update({
              collection: "single-page-conversions",
              where: { agentTaskId: { equals: agentTaskId } },
              data: { agentTaskStatus }
            });


            // Status schema:
            // {
            //   "task_status": "queued" | "running" | "completed" | "failed"
            // }
            if (agentTaskStatus == "completed" || agentTaskStatus == "failed") {
              break;
            }

            if (Date.now() >= endTime) {
              throw new Error("[checkAgentStatus] Timed out");
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          return {
            output: { status: agentTaskStatus }
          };
        },
        onFail: async () => {
          console.error("Job 'checkAgentTaskStatus' failed");
        },
        onSuccess: async () => {
          console.log("Job 'checkAgentTaskStatus' succeeded");
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
            required: true
          },
          {
            name: 'url',
            type: 'text',
            required: true,
          },
        ],
        handler: async ({ job, tasks }) => {
          // Begin the conversion and get a task ID
          const taskIdConvertSinglePage = '1';
          const { agentTaskId } = await tasks.beginSinglePageConversion(taskIdConvertSinglePage, {
            input: {
              documentId: job.input.documentId,
              url: job.input.url
            }
          });
          console.log("[convertSinglePage] agentTaskId:", agentTaskId);

          // Wait on the task to complete
          const taskIdCheckAgentTaskStatus = '2';
          const { status } = await tasks.checkAgentTaskStatus(taskIdCheckAgentTaskStatus, {
            input: { agentTaskId }
          });
          console.log("[convertSinglePage] status:", status);

          // Notify the page that the task is complete
          const taskIdNotifyAgentTaskComplete = '3';
          const { result } = await tasks.notifyAgentTaskComplete(taskIdNotifyAgentTaskComplete, {
            input: { documentId: job.input.documentId }
          });
          console.log("[convertSinglePage] result:", result);
        }
      } as WorkflowConfig<'convertSinglePage'>
    ]
  },
  endpoints: [
    {
      // This endpoint is for creating jobs via the REST API
      path: '/single-page-conversion-tasks',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        console.log("[/single-page-conversion-tasks] Creating job");
        const { task, workflow, data } = await req.json();
        const { documentId, url }: { documentId: string, url: string } = data;

        if (task && workflow) {
          throw new Error("[/single-page-conversion-tasks] Cannot queue both a task and a workflow");
        }

        const job = await req.payload.jobs.queue({
          task,
          workflow,
          input: {
            documentId,
            url
          }
        });

        // Schedule the job to start asynchronously
        setImmediate(async () => {
          try {
            await req.payload.jobs.runByID({ id: job.id });
            console.log(`[/single-page-conversion-tasks] Job '${job.id}' completed successfully`);
          } catch (error) {
            console.error(`[/single-page-conversion-tasks] Job '${job.id}' failed:`, error);
          }
        });

        return Response.json({ message: `Job created. Job ID: ${job.id}, URL: ${url}` }, { status: 201 });
      }
    },
    {
      path: '/single-page-conversion-tasks/:pageId',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { pageId } = req.routeParams as { pageId: string };

        console.log("[/single-page-conversion-tasks/:pageId] pageId:", pageId);

        const result = await req.payload.find({
          collection: "single-page-conversions",
          where: {
            pageId: { equals: pageId }
          },
          limit: 1,
        });
        console.log("[/single-page-conversion-tasks/:pageId] result:", result);
        if (result?.docs.length !== 1) {
          return Response.json({}, { status: 404 });
        }
        const doc = result.docs[0];
        console.log("[/single-page-conversion-tasks/:pageId] doc:", doc);

        return Response.json({ doc }, { status: 200 });
      }
    }
  ]
})
