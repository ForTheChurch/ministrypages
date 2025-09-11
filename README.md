# Build For The Church
A website builder for churches

# Prerequisites

- [Go 1.25+](https://go.dev/dl/)
- [Task](https://taskfile.dev)

# Agent Build

## Usage

Create a `.env` file at the root of the repo with the following:
```
GLOO_CLIENT_ID=<client id>
GLOO_CLIENT_SECRET=<client secret>
```

Run the test code with:
```
task run
```