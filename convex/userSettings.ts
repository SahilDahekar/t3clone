import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { encrypt , decrypt } from "./utils/encryption";

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
        apiKey: encrypt(args.apiKey),
        provider: args.provider,
        createdAt: Date.now(),
      });
    }
    return { success: true };
  },
});

// Retrieve API key for a user
export const getApiKey = internalQuery({
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

    return setting ? decrypt(setting.apiKey) : null;
  },
});


