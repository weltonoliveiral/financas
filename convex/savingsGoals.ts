import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Buscar metas de economia do usuário
export const getUserSavingsGoals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const goals = await ctx.db
      .query("savingsGoals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return goals.map(goal => {
      const percentage = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = goal.targetAmount - goal.currentAmount;
      const today = new Date().toISOString().slice(0, 10);
      const daysRemaining = Math.ceil(
        (new Date(goal.targetDate).getTime() - new Date(today).getTime()) / 
        (1000 * 60 * 60 * 24)
      );

      return {
        ...goal,
        percentage: Math.min(percentage, 100),
        remaining,
        daysRemaining,
        status: percentage >= 100 ? 'completed' : 
                daysRemaining < 0 ? 'overdue' : 
                daysRemaining <= 30 ? 'urgent' : 'active'
      };
    });
  },
});

// Adicionar nova meta de economia
export const addSavingsGoal = mutation({
  args: {
    name: v.string(),
    targetAmount: v.number(),
    targetDate: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    return await ctx.db.insert("savingsGoals", {
      ...args,
      currentAmount: 0,
      userId,
    });
  },
});

// Atualizar progresso da meta
export const updateSavingsProgress = mutation({
  args: {
    id: v.id("savingsGoals"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const goal = await ctx.db.get(args.id);
    if (!goal || goal.userId !== userId) {
      throw new Error("Meta não encontrada");
    }

    const newAmount = Math.max(0, goal.currentAmount + args.amount);
    
    return await ctx.db.patch(args.id, {
      currentAmount: newAmount,
    });
  },
});

// Atualizar meta de economia
export const updateSavingsGoal = mutation({
  args: {
    id: v.id("savingsGoals"),
    name: v.optional(v.string()),
    targetAmount: v.optional(v.number()),
    targetDate: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const { id, ...updates } = args;
    const goal = await ctx.db.get(id);
    
    if (!goal || goal.userId !== userId) {
      throw new Error("Meta não encontrada");
    }

    return await ctx.db.patch(id, updates);
  },
});

// Deletar meta de economia
export const deleteSavingsGoal = mutation({
  args: { id: v.id("savingsGoals") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const goal = await ctx.db.get(args.id);
    if (!goal || goal.userId !== userId) {
      throw new Error("Meta não encontrada");
    }

    await ctx.db.delete(args.id);
  },
});
