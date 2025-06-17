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
    projectId: v.id("projects"),
    title: v.string(),
  },
  handler: async (ctx, { projectId, title }) => {
    const threadId = await ctx.db.insert("threads", {
      projectId,
      title,
      createdAt: Date.now(),
    });
    return threadId;
  },
});