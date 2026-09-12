import Anthropic from '@anthropic-ai/sdk';

export async function askClaude(prompt, options = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is required for Claude requests');
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: options.model || process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest',
    max_tokens: options.max_tokens || 1024,
    temperature: options.temperature,
    system: options.system,
    messages: [{ role: 'user', content: prompt }]
  });
  return {
    provider: 'claude',
    model: response.model,
    content: response.content.filter((item) => item.type === 'text').map((item) => item.text).join('\n'),
    usage: response.usage
  };
}
