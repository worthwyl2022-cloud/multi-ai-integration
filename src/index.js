import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import { askClaude, claudeCodeReview } from './clients/claude.js';
import { askPerplexity } from './clients/perplexity.js';
import { router as proposalRouter } from './router.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));
app.use((req, res, next) => {
  req.requestId = req.get('x-request-id')?.slice(0, 128) || crypto.randomUUID();
  res.set('x-request-id', req.requestId);
  next();
});

app.get('/healthz', (_req, res) => res.json({ status: 'ok', service: 'multi-ai-proposal-gateway' }));
app.get('/readyz', (_req, res) => res.json({
  status: 'ready',
  providers: {
    claude: Boolean(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY),
    perplexity: Boolean(process.env.PERPLEXITY_API_KEY),
  },
  authority: 'delegated-to-cranium-kernel',
}));

app.post('/api/claude', async (req, res, next) => {
  try { res.json({ ai: 'claude', ...(await askClaude(req.body?.prompt, req.body)) }); } catch (error) { next(error); }
});
app.post('/api/claude/code-review', async (req, res, next) => {
  try { res.json({ ai: 'claude', task: 'code-review', ...(await claudeCodeReview(req.body?.code ?? '')) }); } catch (error) { next(error); }
});
app.post('/api/perplexity', async (req, res, next) => {
  try { res.json({ ai: 'perplexity', ...(await askPerplexity(req.body?.prompt ?? req.body?.query, req.body)) }); } catch (error) { next(error); }
});
app.use('/api/route', proposalRouter);

app.use((error, req, res, _next) => {
  const status = Number.isInteger(error.statusCode) ? error.statusCode : 502;
  if (status >= 500) console.error(`[${req.requestId}]`, error);
  res.status(status).json({ error: status >= 500 ? 'provider request failed' : error.message, request_id: req.requestId });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`multi-ai proposal gateway listening on ${port}`));
}

export default app;
