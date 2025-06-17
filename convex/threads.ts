import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("threads").collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
  },
  handler: async (ctx, { userId, title }) => {
    const threadId = await ctx.db.insert("threads", {
      userId,
      title,
      createdAt: Date.now(),
    });
    return threadId;
  },
});



