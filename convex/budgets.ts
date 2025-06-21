import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Buscar orçamentos do usuário
export const getUserBudgets = query({
  args: {
    monthYear: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const currentMonth = args.monthYear || new Date().toISOString().slice(0, 7);

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) => 
        q.eq("userId", userId).eq("monthYear", currentMonth)
      )
      .collect();

    // Buscar informações das categorias e gastos atuais
    const budgetsWithDetails = await Promise.all(
      budgets.map(async (budget) => {
        const category = await ctx.db.get(budget.categoryId);
        
        // Calcular gastos do mês na categoria
        const startDate = `${currentMonth}-01`;
        const endDate = `${currentMonth}-31`;
        
        const expenses = await ctx.db
          .query("expenses")
          .withIndex("by_user_and_category", (q) => 
            q.eq("userId", userId).eq("categoryId", budget.categoryId)
          )
          .collect();

        const monthExpenses = expenses.filter(
          (expense) => expense.date >= startDate && expense.date <= endDate
        );

        const spent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remaining = budget.limit - spent;
        const percentage = (spent / budget.limit) * 100;

        return {
          ...budget,
          category,
          spent,
          remaining,
          percentage: Math.min(percentage, 100),
          status: percentage >= 100 ? 'exceeded' : 
                  percentage >= 90 ? 'warning' : 
                  percentage >= 80 ? 'caution' : 'safe'
        };
      })
    );

    return budgetsWithDetails;
  },
});

// Criar ou atualizar orçamento
export const setBudget = mutation({
  args: {
    categoryId: v.id("categories"),
    monthYear: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    // Verificar se já existe orçamento para esta categoria e mês
    const existingBudgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) => 
        q.eq("userId", userId).eq("monthYear", args.monthYear)
      )
      .collect();

    const existingBudget = existingBudgets.find(
      (budget) => budget.categoryId === args.categoryId
    );

    if (existingBudget) {
      // Atualizar orçamento existente
      return await ctx.db.patch(existingBudget._id, {
        limit: args.limit,
      });
    } else {
      // Criar novo orçamento
      return await ctx.db.insert("budgets", {
        ...args,
        userId,
      });
    }
  },
});

// Deletar orçamento
export const deleteBudget = mutation({
  args: { id: v.id("budgets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const budget = await ctx.db.get(args.id);
    if (!budget || budget.userId !== userId) {
      throw new Error("Orçamento não encontrado");
    }

    await ctx.db.delete(args.id);
  },
});

// Verificar alertas de orçamento
export const getBudgetAlerts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const currentMonth = new Date().toISOString().slice(0, 7);
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) => 
        q.eq("userId", userId).eq("monthYear", currentMonth)
      )
      .collect();

    const alerts = [];
    const startDate = `${currentMonth}-01`;
    const endDate = `${currentMonth}-31`;

    for (const budget of budgets) {
      const category = await ctx.db.get(budget.categoryId);
      
      const expenses = await ctx.db
        .query("expenses")
        .withIndex("by_user_and_category", (q) => 
          q.eq("userId", userId).eq("categoryId", budget.categoryId)
        )
        .collect();

      const monthExpenses = expenses.filter(
        (expense) => expense.date >= startDate && expense.date <= endDate
      );

      const spent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const percentage = (spent / budget.limit) * 100;

      if (percentage >= 80) {
        alerts.push({
          categoryName: category?.name || 'Categoria',
          categoryIcon: category?.icon || '📦',
          spent,
          limit: budget.limit,
          percentage,
          type: percentage >= 100 ? 'exceeded' : 
                percentage >= 90 ? 'warning' : 'caution'
        });
      }
    }

    return alerts;
  },
});
