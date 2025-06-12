import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const getMessages = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("desc")
      .collect(); 
    return messages;
  },
});

export const addMessage = mutation({
  args: {
    threadId: v.id("threads"),
    sender: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      sender: args.sender,
      body: "...",
      createdAt: Date.now(),
      // isComplete: false,
    });

    return "success";
  },
});

// export const updateMessage = internalMutation({
//    args: {
//     messageId: v.id("messages"),
//     body: v.string(),
//     isComplete: v.boolean(),
//   },
//   handler: async (ctx, { messageId, body, isComplete }) => {
//     await ctx.db.patch(messageId, { body, isComplete });
//   },
// })
