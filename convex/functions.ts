import { google } from "@ai-sdk/google";
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
      const model = google("gemini-1.5-flash");

      const allMessages = await ctx.runQuery(
        internal.message.getMessagesForAI,
        { threadId }
      );
      if (!allMessages.length) throw new Error("No messages found");

      const latest = allMessages[allMessages.length - 1];

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
            const fileResponse = await fetch(part.data); // `part.data` is URL
            const arrayBuffer = await fileResponse.arrayBuffer();
            filePart = {
              type: "file",
              data: new Uint8Array(arrayBuffer), // ✅ correct binary buffer
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
        content: [{ type: "text", text: "An error occurred." }],
      });
      throw err;
    }
  },
});
