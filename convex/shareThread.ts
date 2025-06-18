// convex/shareThread.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid"; 

export const createShareLink = mutation({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, { threadId }) => {
    const shareId = nanoid(12);

    await ctx.db.insert("sharedThreads", {
      threadId,
      shareId,
      createdAt: Date.now(),
    });

    return { shareId };
  },
});

export const getSharedThread = query({
  args: {
    shareId: v.string(),
  },
  handler: async (ctx, { shareId }) => {
    const shared = await ctx.db
      .query("sharedThreads")
      .withIndex("by_shareId", (q) => q.eq("shareId", shareId))
      .first();

    if (!shared) return null;

    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("threadId"), shared.threadId))
      .collect();

    return {
      threadId: shared.threadId,
      messages,
    };
  },
});