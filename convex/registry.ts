import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createProviderRegistry } from 'ai';
import { internalQuery } from './_generated/server';
import { v } from 'convex/values';

export const getRegistry = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get API keys from user settings
    const geminiKey = await ctx.db.query("userSettings")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .filter(q => q.eq(q.field("provider"), "gemini"))
      .first()
      .then(setting => setting?.apiKey || "");

    const openaiKey = await ctx.db.query("userSettings")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .filter(q => q.eq(q.field("provider"), "openai"))
      .first()
      .then(setting => setting?.apiKey || "");

    return createProviderRegistry({
      gemini: createGoogleGenerativeAI({ apiKey: geminiKey }),
      openai: createOpenAI({ apiKey: openaiKey })
    });
  }
});
