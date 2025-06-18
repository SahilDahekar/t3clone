// --- Convex Schema (schema.ts) ---
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
    starred: v.optional(v.array(v.id("threads"))),
  }).index("by_token", ["tokenIdentifier"]),
  
  userSettings: defineTable({
    userId: v.id("users"),
    apiKey: v.string(),
    provider: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  threads: defineTable({
    userId: v.id("users"),
    title: v.string(),
    createdAt: v.number(),
    mainThreadId: v.optional(v.id("threads")),
    modelProvider: v.optional(v.string()), 
  }).index("by_user", ["userId"]),

  messages: defineTable({
    threadId: v.id("threads"),
    userId: v.id("users"),
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
  }).index("by_thread", ["threadId"]),

  sharedThreads: defineTable({
    threadId: v.id("threads"),
    shareId: v.string(), 
    createdAt: v.number(),
  }).index("by_shareId", ["shareId"]),
  
});
