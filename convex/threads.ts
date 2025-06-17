import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getThreads = query({
  args: { userId: v.id("users") },
  handler: async (ctx,args) => {
    return await ctx.db.query("threads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
  },
});

export const list = internalQuery({
  args: {threadId: v.id("threads")},
  handler: async (ctx,args) => {
       return await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("desc")
      .collect();
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

export const branch = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    mainThreadId: v.id("threads"),
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





