# MinistryPages
Ministry Pages is a AI-enabled website template for Churches.

## Want to test this out?
Visit https://ministrypages.vercel.app/admin
Username: chris+gloo-tester@sol.company
Password: bRzaET9snNeuLbJ

# Prerequisites

- [Go 1.25+](https://go.dev/dl/)
- [Task](https://taskfile.dev)
- Gloo AI client credentials
- [Firecrawl](https://www.firecrawl.dev/) API Key (sign up for a free account)
- [PayloadCMS API Key](https://payloadcms.com/docs/authentication/api-keys) from the payload web app

# Agent API

## Usage

Create a `.env` file at the root of the repo with the following:
```
GLOO_CLIENT_ID=<client id>
GLOO_CLIENT_SECRET=<client secret>
# OR if using Anthropic use these instead
# ANTHROPIC_API_KEY=<anthropic api key>
# USE_ANTHROPIC_API=true

AGENT_API_PORT=3005
FIRECRAWL_API_KEY=<firecrawl key>

PAYLOAD_BASE_URL=http://localhost:3000
PAYLOAD_API_KEY=<generated api key>

# A secret to let the payload app talk to the agent
AGENT_API_KEY=123456
```

Run the API with:
```
task api
```

By default, it listens on port localhost:3005 according to the env var.

## Routes

### `POST /api/pages/convert-single-page`
Converts a single page. Posts back to PayloadCMS with the updated page.

Request:
```
{
  "url": "<web page url>",
  "pageId": "<payloadcms page id>"
}
```

Response:
```
{
  "task_status": "queued",
  "task_id": "<task id>"
}
```

### `POST /api/pages/convert-whole-site`
Converts a whole site. Creates pages in payloadcms and updates them.

**NOTE:** This can become expensive, consuming a large number of LLM tokens. Keep an eye on it while it runs.

Request:
```
{
  "url": "<root website url>",
}
```

Response:
```
{
  "task_status": "queued",
  "task_id": "<task id>"
}
```

### `GET /api/pages/task/:id` or `GET /api/posts/task/:id`
Reports the status of a task given by the `id` parameter.

Response:
```
{
  "task_status": "queued" | "running" | "completed" | "failed"
}
```

### `POST /api/posts/apply-youtube-transcript`
Gets a Youtube transcript, reformats it as a document, and posts the content to PayloadCMS.

Request:
```
{
  "url": "<youtube url>",
  "postId": "<payloadcms post id>"
}
```

Response:
```
{
  "task_status": "queued",
  "task_id": "<task id>"
}
```


## Notice

There's currently a bug in Gloo AI that prevents us from using their API, so you'll have to use Anthropic's for now.

# Agent Build

This tool is just for testing and lives in `cmd/agentbuild`.
