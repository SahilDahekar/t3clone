import { NextResponse } from "next/server"
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { text } from "stream/consumers";
import { type LanguageModel } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const getModel = (selectedModel: string): LanguageModel => {
  switch (selectedModel) {
    case 'gemini-2.0-flash-lite':
      return google('models/gemini-2.0-flash-lite');
    case 'gemini-2.0-pro':
      return google('models/gemini-2.0-pro');   
    default:
        return google('models/gemini-2.0-flash-lite');   
  }
}        
  
export async function POST(req: Request) {
  console.log('Received request for chat route'+ req);
  const { messages , selectedModel} = await req.json();
  const model:LanguageModel = getModel(selectedModel);
  const result = streamText({
    model: google('models/gemini-2.0-flash-lite'),
    prompt: messages,
  });
//   for await (const textPart of textStream) {
//       console.log(textPart);
// }
  return result.toDataStreamResponse();
}

