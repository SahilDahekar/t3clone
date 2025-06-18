import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  type FilePart,
  type TextPart,
  type CoreMessage,
} from "ai";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const chat = internalAction({
  args: {
    threadId: v.id("threads"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, { threadId, messageId }) => {
    try {
      // Get thread to determine model provider
      const thread = await ctx.runQuery(internal.threads.get, { threadId });
      if (!thread) throw new Error("Thread not found");
      
      const modelProvider = thread.modelProvider || 'gemini';
      let model;
      let apiKey: string | undefined = undefined;

      // Get API key if needed
      // if (modelProvider !== 'gemini') {
      //   const apiKeyResult = await ctx.runQuery(internal.userSettings.getApiKey, {
      //     tokenIdentifier: thread.userId,
      //     provider: modelProvider
      //   });
      //   apiKey = apiKeyResult || undefined;
      //   if (!apiKey) throw new Error(`No API key found for ${modelProvider}`);
      // }

      // Initialize model with API key
      switch (modelProvider) {
        case 'openai':
          model = createOpenAI({ apiKey })("gpt-4-turbo");
          break;
        case 'gemini':
        default:
          model = google("gemini-2.0-flash");
      }

      const allMessages = await ctx.runQuery(
        internal.message.getMessagesForAI,
        { threadId }
      );
      if (!allMessages.length) throw new Error("No messages found");

      const latest = allMessages[allMessages.length - 2];

      const history: CoreMessage[] = allMessages
        .slice(0, -1)
        .map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content
            .filter((c) => c.type === "text")
            .map((c) => c.text)
            .join(" "),
        }));

      let userText = "";
      let filePart: FilePart | null = null;

      if (latest.role === "user") {
        for (const part of latest.content) {
          if (part.type === "text") userText += part.text;
          if (part.type === "file") {
            const fileResponse = await fetch(part.data); 
            const arrayBuffer = await fileResponse.arrayBuffer();
            filePart = {
              type: "file",
              data: new Uint8Array(arrayBuffer), 
              mimeType: part.mimeType,
            };
          }
        }
      }

      // Wrap userText in a TextPart if mixing with FilePart
      const userTextPart: TextPart = { type: "text", text: userText };

      const userContent = filePart
        ? [userTextPart, filePart]
        : userText;

      const modelMessages: CoreMessage[] = [
        ...history,
        { role: "user", content: userContent },
      ];

      let accumulated = "";
      let lastUpdate = 0;

      const { textStream } = streamText({
        model,
        messages: modelMessages,
      });

      for await (const chunk of textStream) {
        accumulated += chunk;
        const now = Date.now();
        if (now - lastUpdate > 100) {
          lastUpdate = now;
          await ctx.runMutation(internal.message.updateMessage, {
            messageId,
            content: [{ type: "text", text: accumulated }],
          });
        }
      }

      await ctx.runMutation(internal.message.updateMessage, {
        messageId,
        content: [{ type: "text", text: accumulated }],
      });

      return { success: true, content: accumulated };
    } catch (err) {
      console.error("AI Chat Error:", err);
      await ctx.runMutation(internal.message.updateMessage, {
        messageId,
        content: [{ type: "text", text: String(err)}],
      });
      throw err;
    }
  },
});

          