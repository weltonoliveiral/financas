import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Buscar despesas do usuário
export const getUserExpenses = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    let query = ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    const expenses = await query.collect();

    // Filtrar por data se especificado
    let filteredExpenses = expenses;
    if (args.startDate || args.endDate) {
      filteredExpenses = expenses.filter((expense) => {
        if (args.startDate && expense.date < args.startDate) return false;
        if (args.endDate && expense.date > args.endDate) return false;
        return true;
      });
    }

    // Filtrar por categoria se especificado
    if (args.categoryId) {
      filteredExpenses = filteredExpenses.filter(
        (expense) => expense.categoryId === args.categoryId
      );
    }

    // Buscar informações das categorias
    const expensesWithCategories = await Promise.all(
      filteredExpenses.map(async (expense) => {
        const category = await ctx.db.get(expense.categoryId);
        return {
          ...expense,
          category,
        };
      })
    );

    return expensesWithCategories.sort((a, b) => b.date.localeCompare(a.date));
  },
});

// Adicionar nova despesa
export const addExpense = mutation({
  args: {
    name: v.string(),
    amount: v.number(),
    categoryId: v.id("categories"),
    date: v.string(),
    paymentMethod: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    return await ctx.db.insert("expenses", {
      ...args,
      userId,
    });
  },
});

// Atualizar despesa
export const updateExpense = mutation({
  args: {
    id: v.id("expenses"),
    name: v.optional(v.string()),
    amount: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    date: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const { id, ...updates } = args;
    const expense = await ctx.db.get(id);
    
    if (!expense || expense.userId !== userId) {
      throw new Error("Despesa não encontrada");
    }

    return await ctx.db.patch(id, updates);
  },
});

// Deletar despesa
export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== userId) {
      throw new Error("Despesa não encontrada");
    }

    await ctx.db.delete(args.id);
  },
});

// Estatísticas do dashboard
export const getDashboardStats = query({
  args: {
    month: v.optional(v.string()), // YYYY-MM format
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const currentMonth = args.month || new Date().toISOString().slice(0, 7);
    const startDate = `${currentMonth}-01`;
    const endDate = `${currentMonth}-31`;

    // Buscar despesas do mês
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const monthExpenses = expenses.filter(
      (expense) => expense.date >= startDate && expense.date <= endDate
    );

    // Calcular total do mês
    const totalMonth = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Agrupar por categoria
    const categoryTotals = new Map();
    for (const expense of monthExpenses) {
      const category = await ctx.db.get(expense.categoryId);
      if (category) {
        const current = categoryTotals.get(category._id) || { 
          name: category.name, 
          color: category.color, 
          icon: category.icon, 
          total: 0 
        };
        current.total += expense.amount;
        categoryTotals.set(category._id, current);
      }
    }

    // Calcular média diária
    const daysInMonth = new Date(
      parseInt(currentMonth.split('-')[0]), 
      parseInt(currentMonth.split('-')[1]), 
      0
    ).getDate();
    const dailyAverage = totalMonth / daysInMonth;

    // Mês anterior para comparação
    const prevMonth = new Date(currentMonth + '-01');
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = prevMonth.toISOString().slice(0, 7);
    const prevStartDate = `${prevMonthStr}-01`;
    const prevEndDate = `${prevMonthStr}-31`;

    const prevMonthExpenses = expenses.filter(
      (expense) => expense.date >= prevStartDate && expense.date <= prevEndDate
    );
    const totalPrevMonth = prevMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalMonth,
      totalPrevMonth,
      dailyAverage,
      expenseCount: monthExpenses.length,
      categoryBreakdown: Array.from(categoryTotals.values()),
      recentExpenses: monthExpenses
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    };
  },
});
