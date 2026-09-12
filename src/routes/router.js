import express from 'express';
import { askClaude } from '../clients/claude.js';
import { askPerplexity } from '../clients/perplexity.js';

const router = express.Router();

function selectAI(taskType, prefer) {
  if (prefer === 'claude' || prefer === 'perplexity') {
    return { selected: prefer, reason: `User preference: ${prefer}` };
  }
  const routing = {
    reasoning: { selected: 'claude', reason: 'Claude is selected for reasoning.' },
    code: { selected: 'claude', reason: 'Claude is selected for code tasks.' },
    creative: { selected: 'claude', reason: 'Claude is selected for creative tasks.' },
    research: { selected: 'perplexity', reason: 'Perplexity is selected for current research.' },
    search: { selected: 'perplexity', reason: 'Perplexity is selected for web search.' },
    news: { selected: 'perplexity', reason: 'Perplexity is selected for current news.' }
  };
  return routing[String(taskType || '').toLowerCase()] || { selected: 'claude', reason: 'Claude is the general-purpose default.' };
}

router.post('/', async (req, res, next) => {
  try {
    const { task_type: taskType, prompt, prefer, max_tokens: maxTokens, temperature } = req.body;
    if (typeof prompt !== 'string' || !prompt.trim()) return res.status(400).json({ error: 'prompt is required' });
    const routing = selectAI(taskType, prefer);
    const result = routing.selected === 'claude'
      ? await askClaude(prompt, { max_tokens: maxTokens, temperature })
      : await askPerplexity(prompt, { max_tokens: maxTokens, temperature });
    res.json({ selected_ai: routing.selected, reasoning: routing.reason, task_type: taskType || 'general', ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
