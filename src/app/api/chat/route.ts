import { NextResponse } from "next/server"
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { text } from "stream/consumers";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('Received request for chat route'+ req);
  const { messages } = await req.json();

  const result = streamText({
    model: google('models/gemini-2.0-flash-lite'),
    prompt: messages,
  });

//   for await (const textPart of textStream) {
//       console.log(textPart);
// }
  return result.toDataStreamResponse();
}