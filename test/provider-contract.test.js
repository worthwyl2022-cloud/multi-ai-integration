import test from 'node:test';
import assert from 'node:assert/strict';
import { askClaude } from '../src/clients/claude.js';
import { askPerplexity } from '../src/clients/perplexity.js';

test('Claude adapter refuses to run without an API key', async () => {
  const previous = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  await assert.rejects(() => askClaude('test'), /ANTHROPIC_API_KEY is required/);
  if (previous) process.env.ANTHROPIC_API_KEY = previous;
});

test('Perplexity adapter refuses to run without an API key', async () => {
  const previous = process.env.PERPLEXITY_API_KEY;
  delete process.env.PERPLEXITY_API_KEY;
  await assert.rejects(() => askPerplexity('test'), /PERPLEXITY_API_KEY is required/);
  if (previous) process.env.PERPLEXITY_API_KEY = previous;
});
