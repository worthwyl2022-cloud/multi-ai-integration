import 'dotenv/config';
import express from 'express';
import router from './routes/router.js';
import { askClaude } from './clients/claude.js';
import { askPerplexity, researchTopic, findLatestNews } from './clients/perplexity.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', providers: ['claude', 'perplexity'] }));
app.post('/api/route', router);
app.post('/api/claude', async (req, res, next) => {
  try {
    if (typeof req.body.prompt !== 'string' || !req.body.prompt.trim()) return res.status(400).json({ error: 'prompt is required' });
    res.json(await askClaude(req.body.prompt, req.body));
  } catch (error) { next(error); }
});
app.post('/api/perplexity', async (req, res, next) => {
  try {
    if (typeof req.body.query !== 'string' || !req.body.query.trim()) return res.status(400).json({ error: 'query is required' });
    res.json(await askPerplexity(req.body.query, req.body));
  } catch (error) { next(error); }
});
app.post('/api/perplexity/research', async (req, res, next) => {
  try {
    if (typeof req.body.topic !== 'string' || !req.body.topic.trim()) return res.status(400).json({ error: 'topic is required' });
    res.json(await researchTopic(req.body.topic));
  } catch (error) { next(error); }
});
app.post('/api/perplexity/news', async (req, res, next) => {
  try {
    if (typeof req.body.topic !== 'string' || !req.body.topic.trim()) return res.status(400).json({ error: 'topic is required' });
    res.json(await findLatestNews(req.body.topic));
  } catch (error) { next(error); }
});
app.use((error, _req, res, _next) => res.status(502).json({ error: error.message }));

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`multi-ai-integration listening on ${port}`));
}

export default app;
