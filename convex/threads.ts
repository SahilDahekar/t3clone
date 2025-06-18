import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getThreads = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx,args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) {
      return [];
    }

    return await ctx.db.query("threads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
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
    tokenIdentifier: v.string(),
    title: v.string(),
  },
  handler: async (ctx, { tokenIdentifier, title }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const threadId = await ctx.db.insert("threads", {
      userId: user._id,
      title,
      createdAt: Date.now(),
    });
    return threadId;
  },
});

export const branch = mutation({
  args: {
    tokenIdentifier: v.string(),
    title: v.string(),
    mainThreadId: v.id("threads"),
  },
  handler: async (ctx, { tokenIdentifier, title, mainThreadId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const threadId = await ctx.db.insert("threads", {
      userId: user._id,
      title,
      createdAt: Date.now(),
      mainThreadId,
    });
    return threadId;
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, { name, tokenIdentifier }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      name,
      tokenIdentifier,
      starred: [],
    });
    return userId;
  }
});