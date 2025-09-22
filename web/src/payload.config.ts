// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import path from 'path'
import { buildConfig, PayloadRequest, WorkflowConfig } from 'payload'
import sharp from 'sharp' // sharp-import
import { fileURLToPath } from 'url'

import { defaultLexical } from '@/fields/defaultLexical'
import { Categories } from './collections/Categories'
import { Events } from './collections/Events'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Series } from './collections/Series'
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
  collections: [Pages, Media, Posts, Events, Series, Categories, Users],
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
        // This task is for initiating a migration via the agent backend. This
        // might split into two or more tasks, possibly a workflow.
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

          // TODO: Call agent backend and get a task ID representing the agent's task
          console.log(`Running  'beginSinglePageConversion' task with document ID '${documentId}' and URL '${url}'`)


          const agentTaskId = "abc123"; // From the agent backend;

          // TODO: Handle case where existing migration task is in progress
          await req.payload.update({
            collection: "pages",
            id: documentId,
            data: {
              migrationTaskId: agentTaskId
            }
          });

          return {
            output: { agentTaskId }
          };
        },
        onFail: async () => {
          console.log("Job 'beginSinglePageConversion' failed");
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

          // TODO: Call agent backend and get a the status of the task
          console.log(`[checkAgentTaskStatus] Checking status of task ID '${agentTaskId}'`);

          // Simulate long-running process
          console.log("[checkAgentTaskStatus] Doing work for 30 seconds");
          await new Promise(r => setTimeout(r, 30000));
          console.log("[checkAgentTaskStatus] Work complete");

          const status = "This is a dummy task";

          return {
            output: { status }
          };
        },
        onFail: async () => {
          console.log("Job 'checkAgentTaskStatus' failed");
        },
        onSuccess: async () => {
          console.log("Job 'checkAgentTaskStatus' succeeded");
        },
      },
      {
        // This task updates the `migrationTaskId` field on a page
        retries: 2,
        slug: 'notifyAgentTaskComplete',
        inputSchema: [
          {
            name: 'documentId',
            type: 'text',
            required: true
          }
        ],
        outputSchema: [
          {
            name: 'result',
            type: 'text',
            required: true,
          }
        ],
        handler: async ({ input, job, req }: { input: { documentId: string }, job: any, req: any }) => {
          const { documentId } = input;

          // TODO: Call agent backend and get a the status of the task
          console.log(`Notifying document ID '${documentId}' that the agent task is complete`);

          await req.payload.update({
            collection: "pages",
            id: documentId,
            data: { migrationTaskId: "" }
          });

          const result = "success";

          return {
            output: { result }
          };
        },
        onFail: async () => {
          console.log("Job 'notifyAgentTaskComplete' failed");
        },
        onSuccess: async () => {
          console.log("Job 'notifyAgentTaskComplete' succeeded");
        },
      }
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
      path: '/jobs',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        console.log('Creating job via the /jobs endpoint');
        const { task, workflow, data } = await req.json();
        const { documentId, url }: { documentId: string, url: string } = data;

        if (task && workflow) {
          throw new Error("Cannot queue both a task and a workflow");
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
            console.log(`Job '${job.id}' completed successfully`);
          } catch (error) {
            console.error(`Job '${job.id}' failed:`, error);
          }
        });

        return Response.json({ message: `Job created. Job ID: ${job.id}, URL: ${url}` }, { status: 201 });
      }
    },
    {
      // This endpoint is for getting the status of a job
      path: '/jobs/:id',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { id } = req.routeParams as { id: string };

        const job = await req.payload.findByID({
          collection: "payload-jobs",
          id
        });
        if (!job) {
          return Response.json({}, { status: 404 });
        }

        console.log(`Checking status of job '${id}':`, job.taskStatus);

        return Response.json({ status: job.taskStatus }, { status: 201 });
      }
    }
  ]
})
