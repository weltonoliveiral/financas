import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Perfis de usuário (estende a funcionalidade de auth)
  userProfiles: defineTable({
    userId: v.id("users"),
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
  }).index("by_user", ["userId"]),

  // Categorias de despesas
  categories: defineTable({
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    userId: v.id("users"),
    isDefault: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  // Despesas
  expenses: defineTable({
    name: v.string(),
    amount: v.number(),
    categoryId: v.id("categories"),
    date: v.string(), // YYYY-MM-DD format
    paymentMethod: v.string(),
    description: v.optional(v.string()),
    receiptUrl: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_category", ["userId", "categoryId"]),

  // Orçamentos
  budgets: defineTable({
    categoryId: v.id("categories"),
    monthYear: v.string(), // YYYY-MM format
    limit: v.number(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_month", ["userId", "monthYear"]),

  // Metas de economia
  savingsGoals: defineTable({
    name: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    targetDate: v.string(), // YYYY-MM-DD format
    description: v.optional(v.string()),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  // Métodos de pagamento
  paymentMethods: defineTable({
    name: v.string(),
    icon: v.string(),
    userId: v.id("users"),
    isDefault: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
