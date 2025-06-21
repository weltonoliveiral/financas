import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Atualizar perfil do usuário
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    preferences: v.optional(v.object({
      currency: v.string(),
      language: v.string(),
      timezone: v.string(),
      notifications: v.object({
        budgetAlerts: v.boolean(),
        weeklyReports: v.boolean(),
        monthlyReports: v.boolean(),
        goalReminders: v.boolean(),
      }),
      privacy: v.object({
        shareData: v.boolean(),
        analytics: v.boolean(),
        marketing: v.boolean(),
      }),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    // Update basic user info
    if (args.name !== undefined || args.phone !== undefined) {
      const userUpdates: any = {};
      if (args.name !== undefined) userUpdates.name = args.name;
      if (args.phone !== undefined) userUpdates.phone = args.phone;
      await ctx.db.patch(userId, userUpdates);
    }

    // Update preferences
    if (args.preferences !== undefined) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();

      if (profile) {
        await ctx.db.patch(profile._id, { preferences: args.preferences });
      } else {
        await ctx.db.insert("userProfiles", { userId, preferences: args.preferences });
      }
    }

    return { success: true };
  },
});

// Buscar estatísticas do usuário
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    // Buscar todas as despesas do usuário
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Buscar todas as categorias do usuário
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Calcular estatísticas básicas
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoriesUsed = new Set(expenses.map(e => e.categoryId)).size;

    // Calcular dias ativos (dias únicos com despesas)
    const uniqueDates = new Set(expenses.map(e => e.date));
    const daysActive = uniqueDates.size;

    // Agrupar por mês
    const monthlyData = new Map();
    expenses.forEach(expense => {
      const monthKey = expense.date.slice(0, 7); // YYYY-MM
      const current = monthlyData.get(monthKey) || 0;
      monthlyData.set(monthKey, current + expense.amount);
    });

    // Converter para array e ordenar
    const monthlyTrends = Array.from(monthlyData.entries())
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric' 
        }),
        amount
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Últimos 6 meses

    const maxMonthlyAmount = Math.max(...monthlyTrends.map(m => m.amount), 1);

    // Top categorias
    const categoryTotals = new Map();
    for (const expense of expenses) {
      const category = await ctx.db.get(expense.categoryId);
      if (category) {
        const current = categoryTotals.get(category._id) || { 
          name: category.name, 
          icon: category.icon, 
          total: 0, 
          count: 0 
        };
        current.total += expense.amount;
        current.count += 1;
        categoryTotals.set(category._id, current);
      }
    }

    const topCategories = Array.from(categoryTotals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalExpenses,
      totalAmount,
      categoriesUsed,
      daysActive,
      monthlyTrends,
      maxMonthlyAmount,
      topCategories,
    };
  },
});

// Exportar dados do usuário
export const exportUserData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    // Buscar todos os dados do usuário
    const user = await ctx.db.get(userId);
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const savingsGoals = await ctx.db
      .query("savingsGoals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const paymentMethods = await ctx.db
      .query("paymentMethods")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return {
      exportDate: new Date().toISOString(),
      user: {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        preferences: profile?.preferences,
      },
      expenses,
      categories,
      budgets,
      savingsGoals,
      paymentMethods,
    };
  },
});

// Deletar conta do usuário
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    // Deletar todos os dados relacionados ao usuário
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const savingsGoals = await ctx.db
      .query("savingsGoals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const paymentMethods = await ctx.db
      .query("paymentMethods")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Deletar todos os registros
    for (const expense of expenses) {
      await ctx.db.delete(expense._id);
    }
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }
    for (const budget of budgets) {
      await ctx.db.delete(budget._id);
    }
    for (const goal of savingsGoals) {
      await ctx.db.delete(goal._id);
    }
    for (const method of paymentMethods) {
      await ctx.db.delete(method._id);
    }

    // Deletar o usuário
    await ctx.db.delete(userId);

    return { success: true };
  },
});

// Buscar configurações do usuário
export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile?.preferences || {
      currency: "BRL",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      notifications: {
        budgetAlerts: true,
        weeklyReports: true,
        monthlyReports: true,
        goalReminders: true,
      },
      privacy: {
        shareData: false,
        analytics: true,
        marketing: false,
      },
    };
  },
});
