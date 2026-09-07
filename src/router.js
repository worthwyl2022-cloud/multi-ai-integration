import express from 'express';
import { askClaude } from './clients/claude.js';
import { askPerplexity } from './clients/perplexity.js';

export const router = express.Router();

const ROUTES = {
  reasoning: ['claude', 'Claude is selected for reasoning'],
  code: ['claude', 'Claude is selected for code analysis'],
  creative: ['claude', 'Claude is selected for drafting'],
  research: ['perplexity', 'Perplexity is selected for web-grounded research'],
  search: ['perplexity', 'Perplexity is selected for web-grounded search'],
  news: ['perplexity', 'Perplexity is selected for current-information queries'],
};

export function selectAI(taskType = 'general', preferred) {
  if (preferred === 'claude' || preferred === 'perplexity') {
    return { selected: preferred, reason: `Explicit provider preference: ${preferred}` };
  }
  const [selected, reason] = ROUTES[String(taskType).toLowerCase()] ?? ['claude', 'Claude is the default proposal provider'];
  return { selected, reason };
}

router.post('/', async (req, res, next) => {
  try {
    const { task_type: taskType, prompt, prefer, max_tokens: maxTokens, temperature, system } = req.body ?? {};
    const routing = selectAI(taskType, prefer);
    const result = routing.selected === 'claude'
      ? await askClaude(prompt, { max_tokens: maxTokens, temperature, system })
      : await askPerplexity(prompt, { max_tokens: maxTokens, temperature });

    res.json({
      selected_ai: routing.selected,
      reasoning: routing.reason,
      task_type: taskType ?? 'general',
      ...result,
    });
  } catch (error) {
    next(error);
  }
});
