import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Buscar métodos de pagamento do usuário
export const getUserPaymentMethods = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    return await ctx.db
      .query("paymentMethods")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Criar métodos de pagamento padrão
export const createDefaultPaymentMethods = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const defaultMethods = [
      { name: "Dinheiro", icon: "💵" },
      { name: "Cartão de Débito", icon: "💳" },
      { name: "Cartão de Crédito", icon: "💳" },
      { name: "PIX", icon: "📱" },
      { name: "Transferência", icon: "🏦" },
      { name: "Boleto", icon: "📄" },
    ];

    const methodIds = [];
    for (const method of defaultMethods) {
      const id = await ctx.db.insert("paymentMethods", {
        ...method,
        userId,
        isDefault: true,
      });
      methodIds.push(id);
    }

    return methodIds;
  },
});

// Adicionar novo método de pagamento
export const addPaymentMethod = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    return await ctx.db.insert("paymentMethods", {
      ...args,
      userId,
      isDefault: false,
    });
  },
});
