import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Save or update API key for a user
export const saveApiKey = mutation({
  args: {
    tokenIdentifier: v.string(),
    apiKey: v.string(),
    provider: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if key already exists for this user and provider
    const existing = await ctx.db
      .query("userSettings")
      .filter(q =>
        q.eq(q.field("userId"), user._id) &&
        q.eq(q.field("provider"), args.provider)
      )
      .first();

    if (existing) {
      // Update existing key
      await ctx.db.patch(existing._id, { apiKey: args.apiKey });
    } else {
      // Create new key entry
      await ctx.db.insert("userSettings", {
        userId: user._id,
        apiKey: args.apiKey,
        provider: args.provider,
        createdAt: Date.now(),
      });
    }
    return { success: true };
  },
});

// Retrieve API key for a user
export const getApiKey = query({
  args: {
    tokenIdentifier: v.string(),
    provider: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) {
      return null;
    }

    const setting = await ctx.db
      .query("userSettings")
      .filter(q =>
        q.eq(q.field("userId"), user._id) &&
        q.eq(q.field("provider"), args.provider)
      )
      .first();

    return setting?.apiKey || null;
  },
});

// Validate an API key (simplified example)
export const validateApiKey = query({
  args: { apiKey: v.string() },
  handler: async (_, args) => {
    // In a real implementation, you would make a test API call
    // For now, just validate the format
    return args.apiKey.startsWith("AIza") && args.apiKey.length > 30;
  },
});
