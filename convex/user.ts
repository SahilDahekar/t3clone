import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// This mutation will store or update a user in the 'users' table
// It's designed to be called when a user signs in or their info might change.
export const store = mutation({
  args: {
    tokenIdentifier: v.string(), // Clerk's user ID
    name: v.string(),            // User's display name
  },
  handler: async (ctx, args) => {
    const { db } = ctx;
    const { tokenIdentifier, name } = args;

    // Check if the user already exists in the 'users' table
    const existingUser = await db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (existingUser) {
      // If user exists, update their name if it has changed
      if (existingUser.name !== name) {
        await db.patch(existingUser._id, { name });
      }
      return existingUser._id; // Return the existing user's ID
    } else {
      // If user does not exist, create a new entry
      const userId = await db.insert("users", { tokenIdentifier, name , starred: [] });
      return userId; // Return the new user's ID
    }
  },
});

// Example query to get a user by tokenIdentifier (optional, but good for linking)
export const get = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();
  },
});

export const getstarredThreads = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {      
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }
    return user.starred || [];  
  }});

export const starThreads = mutation({
  args: {
    tokenIdentifier: v.string(),
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const { db } = ctx;

    const user = await db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the current starred threads, defaulting to an empty array if not present
    const currentStarredThreads: Id<"threads">[] = user.starred || [];

    // Check if the thread is already starred to prevent duplicates
    if (!currentStarredThreads.includes(args.threadId)) {
      const newStarredThreads = [...currentStarredThreads, args.threadId];

      // Patch the user document to update the starredThreads array
      await db.patch(user._id, {
        starred: newStarredThreads,
      });

      return { success: true, starredThreads: newStarredThreads };
    } else {
      // If already starred, just return success and the current list
      return { success: true, starredThreads: currentStarredThreads, message: "Thread already starred" };
    }
  },
});

// Optional: Add an unstar mutation as well for completeness
export const unstarThreads = mutation({
  args: {
    tokenIdentifier: v.string(),
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const { db } = ctx;

    const user = await db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const currentStarredThreads: Id<"threads">[] = user.starred || [];

    // Filter out the threadId to unstar it
    const newStarredThreads = currentStarredThreads.filter(
      (id) => id !== args.threadId
    );

    // Only patch if the list actually changed
    if (newStarredThreads.length < currentStarredThreads.length) {
      await db.patch(user._id, {
        starred: newStarredThreads,
      });
      return { success: true, starredThreads: newStarredThreads };
    } else {
      return { success: true, starredThreads: currentStarredThreads, message: "Thread not found in starred list" };
    }
  },
});