import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";



export const getMessages = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .take(20);
  },
});



export const getMessagesForAI = internalQuery({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .take(100);
  },
});


export const send = mutation({
  args: {
    threadId: v.id("threads"),
    tokenIdentifier: v.string(),
    role: v.literal("user"),
    content: v.array(
      v.union(
        v.object({ type: v.literal("text"), text: v.string() }),
        v.object({
          type: v.literal("file"),
          data: v.string(),
          mimeType: v.string(),
          fileName: v.optional(v.string()),
        })
      )
    ),
    parentMessageId: v.optional(v.id("messages")),  
  },
  handler: async (ctx, { threadId, tokenIdentifier, role, content}) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.insert("messages", {
      threadId,
      userId: user._id,
      role,
      content,
      createdAt: Date.now(),
    });

    const assistantMessageId = await ctx.db.insert("messages", {
      threadId,
      userId: user._id,
      role: "assistant",
      content: [{ type: "text", text: "..." }],
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.functions.chat, {
      threadId,
      messageId: assistantMessageId,
    });
  },
});



export const updateMessage = internalMutation({
  args: {
    messageId: v.id("messages"),
    content: v.array(
      v.object({
        type: v.literal("text"),
        text: v.string(),
      })
    ),
  },
  handler: async (ctx, { messageId, content }) => {
    await ctx.db.patch(messageId, { content });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
