import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  
  threads: defineTable({
    projectId: v.id("projects"),
    title: v.string(), 
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  
  messages: defineTable({
    threadId: v.id("threads"),
    sender: v.string(), 
    body: v.string(),
    createdAt: v.number(),
    // isComplete: v.boolean(),
  }).index("by_thread", ["threadId"]),

  
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(), 
  }).index("by_token", ["tokenIdentifier"]),
});