import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Buscar categorias do usuário
export const getUserCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    return await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Criar categoria padrão
export const createDefaultCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const defaultCategories = [
      { name: "Alimentação", icon: "🍽️", color: "#FF6B6B" },
      { name: "Transporte", icon: "🚗", color: "#4ECDC4" },
      { name: "Moradia", icon: "🏠", color: "#45B7D1" },
      { name: "Saúde", icon: "⚕️", color: "#96CEB4" },
      { name: "Educação", icon: "📚", color: "#FFEAA7" },
      { name: "Lazer", icon: "🎮", color: "#DDA0DD" },
      { name: "Roupas", icon: "👕", color: "#98D8C8" },
      { name: "Outros", icon: "📦", color: "#A0A0A0" },
    ];

    const categoryIds = [];
    for (const category of defaultCategories) {
      const id = await ctx.db.insert("categories", {
        ...category,
        userId,
        isDefault: true,
      });
      categoryIds.push(id);
    }

    return categoryIds;
  },
});

// Adicionar nova categoria
export const addCategory = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    return await ctx.db.insert("categories", {
      ...args,
      userId,
      isDefault: false,
    });
  },
});

// Atualizar categoria
export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const { id, ...updates } = args;
    const category = await ctx.db.get(id);
    
    if (!category || category.userId !== userId) {
      throw new Error("Categoria não encontrada");
    }

    return await ctx.db.patch(id, updates);
  },
});

// Deletar categoria
export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Categoria não encontrada");
    }

    // Verificar se há despesas usando esta categoria
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_category", (q) => 
        q.eq("userId", userId).eq("categoryId", args.id)
      )
      .collect();

    if (expenses.length > 0) {
      throw new Error("Não é possível deletar categoria com despesas associadas");
    }

    await ctx.db.delete(args.id);
  },
});
