// --- Convex Schema (schema.ts) ---
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),

  projects: defineTable({
    name: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
    mainThreadId: v.optional(v.id("threads")),
  }).index("by_user", ["userId"]),

  threads: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  messages: defineTable({
  threadId: v.id("threads"),
  role: v.string(),
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
  createdAt: v.number(),
  parentMessageId: v.optional(v.id("messages")),  
  parentThreadId: v.optional(v.id("threads")),
}).index("by_thread", ["threadId"]),

});
