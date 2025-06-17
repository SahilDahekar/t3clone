import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    id: v.id("users")
  },
  handler: async (ctx, { name , id }) => {
    const projectId = await ctx.db.insert("projects", {
      name,
      userId: id,
      createdAt: Date.now(),
    });
    return projectId;
  },
});