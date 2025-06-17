// --- Convex Schema (schema.ts) ---
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
    threadIds: v.array(v.id("threads")),
  }).index("by_token", ["tokenIdentifier"]),

  threads: defineTable({
    userId: v.id("users"),
    title: v.string(),
    createdAt: v.number(),
    mainThreadId: v.optional(v.id("threads")),
  }).index("by_user", ["userId"]),

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

}).index("by_thread", ["threadId"]),

});
