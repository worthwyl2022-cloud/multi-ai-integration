# Multi-AI Proposal Gateway

A small, deployable gateway for Claude and Perplexity proposals. **Providers generate proposals; they do not acquire Cranium authority.** Any durable memory, canon update, permission change, or external action must pass through the canonical Cranium kernel and its governed commit boundary.

## Routes

| Route | Purpose |
|---|---|
| `GET /healthz` | Liveness check |
| `GET /readyz` | Provider configuration and authority-boundary status |
| `POST /api/claude` | Claude proposal generation |
| `POST /api/claude/code-review` | Advisory Claude code review |
| `POST /api/perplexity` | Perplexity research/search proposal |
| `POST /api/route` | Task-type routing to a provider |

Responses include `proposal_only: true` and `authority_status: "UNCOMMITTED"`. This is deliberate: semantic output is not authority.

## Run locally

```bash
cp .env.example .env
npm ci
npm test
npm start
```

Required environment variables are provider-specific:

```env
ANTHROPIC_API_KEY=...
PERPLEXITY_API_KEY=...
PORT=3000
```

The gateway starts without provider credentials so health and deployment probes remain available; provider requests return a clear `503` until configured. Never commit credentials.

## Architecture boundary

This repository is an adapter/proposal plane. It does not implement a second authority engine, canon lane, receipt issuer, or state reducer. The canonical authority path is the `cranium-kernel` repository. See its [governance boundary](https://github.com/worthwyl2022-cloud/cranium-kernel/blob/main/GOVERNANCE_BOUNDARY.md).

## Evidence boundary

Green tests prove routing and input behavior only. They do not prove provider correctness, factuality, security certification, production availability, or Cranium authority. Provider responses must be independently evaluated and evidence-bound before any governed commit.
