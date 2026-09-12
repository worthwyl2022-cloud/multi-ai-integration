import axios from 'axios';

const endpoint = process.env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai/chat/completions';

export async function askPerplexity(query, options = {}) {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is required for Perplexity requests');
  }
  const response = await axios.post(endpoint, {
    model: options.model || process.env.PERPLEXITY_MODEL || 'sonar',
    messages: [{ role: 'user', content: query }],
    max_tokens: options.max_tokens || 1024,
    temperature: options.temperature
  }, {
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 30_000
  });
  return {
    provider: 'perplexity',
    model: response.data.model,
    content: response.data.choices?.[0]?.message?.content || '',
    citations: response.data.citations || [],
    usage: response.data.usage
  };
}

export const researchTopic = (topic) => askPerplexity(`Research this topic with current sources: ${topic}`);
export const findLatestNews = (topic) => askPerplexity(`Find the latest reliable news about: ${topic}`);
