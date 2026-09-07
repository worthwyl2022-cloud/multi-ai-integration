import test from 'node:test';
import assert from 'node:assert/strict';
import { selectAI } from '../src/router.js';

test('routes research to Perplexity by default', () => {
  assert.deepEqual(selectAI('research'), {
    selected: 'perplexity',
    reason: 'Perplexity is selected for web-grounded research',
  });
});

test('honors an explicit supported provider preference', () => {
  assert.equal(selectAI('research', 'claude').selected, 'claude');
});

test('falls back to Claude for unknown proposal types', () => {
  assert.equal(selectAI('unknown').selected, 'claude');
});

test('does not expose authority issuance as a routing outcome', () => {
  assert.equal(Object.hasOwn(selectAI('code'), 'authority'), false);
});
