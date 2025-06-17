import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createProviderRegistry } from 'ai';

export const registry = createProviderRegistry({
  
  gemini: createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY ,
  }),
  openai: createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
});

