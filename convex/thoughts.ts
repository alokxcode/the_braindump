import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getThoughts = query({
  handler: async (ctx) => {
    const thoughts = await ctx.db.query("thoughts").order("desc").collect();
    return thoughts;
  },
});

export const addThoughts = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const todoId = await ctx.db.insert("thoughts", {
      text: args.text,
      isCompleted: false,
    });
    return todoId;
  },
});

export const toggleThoughts = mutation({
  args: { id: v.id("thoughts") },
  handler: async (ctx, args) => {
    const thought = await ctx.db.get(args.id);
    if (!thought) throw new ConvexError("Thought not found");
    await ctx.db.patch(args.id, {
      isCompleted: !thought.isCompleted,
    });
  },
});

export const deleteThoughts = mutation({
  args: { id: v.id("thoughts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateThought = mutation({
  args: {
    id: v.id("thoughts"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      text: args.text,
    });
  },
});

export const deleteAllThoughts = mutation({
  handler: async (ctx) => {
    const thoughts = await ctx.db.query("thoughts").collect();

    for (const thought of thoughts) {
      await ctx.db.delete(thought._id);
    }

    return { deletedCount: thoughts.length };
  },
});
