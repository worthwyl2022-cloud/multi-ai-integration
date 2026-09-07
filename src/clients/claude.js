import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MODEL = process.env.CLAUDE_MODEL ?? 'claude-3-5-sonnet-20241022';
const MAX_PROMPT_LENGTH = 32_000;

function requirePrompt(prompt) {
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw Object.assign(new Error('prompt must be a non-empty string'), { statusCode: 400 });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw Object.assign(new Error(`prompt exceeds ${MAX_PROMPT_LENGTH} characters`), { statusCode: 413 });
  }
  return prompt.trim();
}

export async function askClaude(prompt, options = {}) {
  const normalized = requirePrompt(prompt);
  if (!process.env.ANTHROPIC_API_KEY && !process.env.CLAUDE_API_KEY) {
    throw Object.assign(new Error('Anthropic credentials are not configured'), { statusCode: 503 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? process.env.CLAUDE_API_KEY });
  const message = await client.messages.create({
    model: options.model ?? DEFAULT_MODEL,
    max_tokens: Math.min(Math.max(Number(options.max_tokens) || 1024, 1), 8192),
    temperature: options.temperature == null ? undefined : Math.min(Math.max(Number(options.temperature), 0), 1),
    system: typeof options.system === 'string' ? options.system.slice(0, 8_000) : undefined,
    messages: [{ role: 'user', content: normalized }],
  });

  return {
    model: message.model,
    text: message.content.filter((block) => block.type === 'text').map((block) => block.text).join('\n'),
    usage: message.usage,
    proposal_only: true,
    authority_status: 'UNCOMMITTED',
  };
}

export async function claudeCodeReview(code) {
  return askClaude(`Review this code for correctness, security, and maintainability. Do not claim execution.\n\n${code}`, {
    system: 'Return findings as a concise review. This is advisory proposal output, not an authority decision.',
  });
}
