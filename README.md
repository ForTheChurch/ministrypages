# Build For The Church
A website builder for churches

# Prerequisites

- [Go 1.25+](https://go.dev/dl/)
- [Task](https://taskfile.dev)
- Gloo AI client credentials
- [Firecrawl](https://www.firecrawl.dev/) API Key (sign up for a free account)

# Agent Build

## Usage

Create a `.env` file at the root of the repo with the following:
```
GLOO_CLIENT_ID=<client id>
GLOO_CLIENT_SECRET=<client secret>
FIRECRAWL_API_KEY=<firecrawl key>
```

Check out the test variables at the top of `main.go` (you'll probably want to change them).

Run the test code with:
```
task run
```

See the generated output in `output/`