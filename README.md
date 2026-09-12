# Multi-AI Integration

Multi-AI Integration is an executable gateway for Claude and Perplexity provider workflows. It exposes a single routing endpoint while preserving direct provider endpoints, validates required credentials, and returns provider metadata and usage information.

## Implemented surface

The server is implemented in `src/index.js`. Claude requests use the Anthropic SDK. Perplexity requests use the provider chat-completions endpoint. Routing selects a provider based on task type or an explicit preference. The server does not fabricate provider responses: requests fail when the required credential is absent or when the upstream provider rejects the request.

The repository does not contain a private GitHub Copilot backend. GitHub-hosted model access must be added through an explicitly configured provider adapter rather than being represented as an already-connected Copilot service.

## Run locally

```bash
npm ci
npm test
npm audit --audit-level=high
npm start
```

Configure credentials through environment variables:

```bash
export ANTHROPIC_API_KEY=...
export PERPLEXITY_API_KEY=...
export PORT=3000
```

## Endpoints

`GET /health` returns the configured provider surface. `POST /api/claude` accepts `{ "prompt": "..." }`. `POST /api/perplexity` accepts `{ "query": "..." }`. `POST /api/route` accepts `{ "task_type": "research", "prompt": "..." }` and chooses the configured provider. Research and news helpers are available at `/api/perplexity/research` and `/api/perplexity/news`.

## Security boundary

Never commit API keys. The gateway is an integration service, not an authority engine, and it does not make governance decisions on behalf of the Cranium kernel.
