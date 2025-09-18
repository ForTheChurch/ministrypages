// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import path from 'path'
import { buildConfig, PayloadRequest, PayloadResponse } from 'payload'
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
        slug: 'migratePage',
        inputSchema: [
          {
            name: 'url',
            type: 'text',
            required: true,
          }
        ],
        outputSchema: [
          {
            name: 'jobId',
            type: 'text',
            required: true,
          }
        ],
        // TODO: Move handler to a separate file
        // https://payloadcms.com/docs/jobs-queue/tasks#defining-tasks-in-the-config
        handler: async ({ input, job, req }: { input: { url: string }, job: any, req: any }) => {
          const { url } = input;

          // TODO: Call agent backend and get a task ID representing the agent's task
          console.log(`Running  'migratePage' task with URL '${url}'`)

          // Simulate long-running process
          console.log("Sleeping for 20 seconds");
          await new Promise(r => setTimeout(r, 20000));
          console.log("Done sleeping");

          const taskId = "abc123"; // From the agent backend;

          return {
            output: {
              url,
              taskId
            }
          };
        },
        onFail: async () => {
          console.log("Job 'migratePage' failed");
        },
        onSuccess: async () => {
          console.log("Job 'migratePage' succeeded");
        },
      }
    ],
  },
  endpoints: [
    {
      // This endpoint is for creating jobs via the REST API
      path: '/jobs',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        console.log('Creating job via the /jobs endpoint');
        const { task, data } = await req.json();
        const { url } = data;
        const job = await req.payload.jobs.queue({
          task,
          input: {
            url: url
          }
        });

        // Let this run asynchronously
        // TODO: Split the queuing and running into two endpoints and allow
        // the user to handle the asynchronous operation.
        req.payload.jobs.runByID({ id: job.id })
          .then((result) => {
            console.log(`Job ${job.id} completed successfully`);
          })
          .catch((error) => {
            console.error(`Job ${job.id} failed:`, error);
          });

        return Response.json({ message: `Job started. Job ID: ${job.id}, URL: ${url}` }, { status: 201 });
      }
    }
  ]
})
