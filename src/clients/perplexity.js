const DEFAULT_MODEL = process.env.PERPLEXITY_MODEL ?? 'sonar-pro';
const API_URL = 'https://api.perplexity.ai/chat/completions';

export async function askPerplexity(prompt, options = {}) {
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw Object.assign(new Error('prompt must be a non-empty string'), { statusCode: 400 });
  }
  if (prompt.length > 32_000) {
    throw Object.assign(new Error('prompt exceeds 32000 characters'), { statusCode: 413 });
  }
  if (!process.env.PERPLEXITY_API_KEY) {
    throw Object.assign(new Error('Perplexity credentials are not configured'), { statusCode: 503 });
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model ?? DEFAULT_MODEL,
      max_tokens: Math.min(Math.max(Number(options.max_tokens) || 1024, 1), 8192),
      temperature: options.temperature == null ? undefined : Math.min(Math.max(Number(options.temperature), 0), 1),
      messages: [{ role: 'user', content: prompt.trim() }],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(payload.error?.message ?? `Perplexity request failed (${response.status})`), {
      statusCode: response.status >= 500 ? 502 : 400,
    });
  }

  return {
    model: payload.model,
    text: payload.choices?.[0]?.message?.content ?? '',
    citations: payload.citations ?? [],
    usage: payload.usage,
    proposal_only: true,
    authority_status: 'UNCOMMITTED',
  };
}
