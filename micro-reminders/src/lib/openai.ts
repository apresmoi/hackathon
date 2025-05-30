import OpenAI from 'openai/index.mjs';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const defaultModel = "gpt-4-turbo-preview"; 