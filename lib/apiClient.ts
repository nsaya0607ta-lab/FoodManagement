"use client";

// このモジュールはブラウザの localStorage 上で完結するデータ操作を提供する。
// 以前は API ルート（サーバー）へ fetch していたが、Vercel 等のサーバーレス環境では
// 書き込み可能なファイルシステムが無いため、すべてクライアント側の lib/store.ts を
// 直接呼び出す方式に変更した。呼び出し側（コンポーネント）の使い方は変わらない。
import * as store from "./store";
import type { CreateInventoryInput, CreateRuleInput, RecipeMatch } from "./store";
import type { ConsumptionRule, Recipe, StorageArea } from "./types";

export const api = {
  listStorageAreas: async () => {
    const areas = store.listStorageAreas();
    const counts = store.getStorageAreaCounts();
    return { areas: areas.map((a) => ({ ...a, itemCount: counts[a.id] ?? 0 })) as (StorageArea & { itemCount: number })[] };
  },
  storageAreaInventory: async (id: string) => ({ items: store.getStorageAreaInventory(id) }),
  listInventory: async () => ({ items: store.listInventory() }),
  getInventoryItem: async (id: string) => ({
    item: store.getInventoryItem(id),
    history: store.getInventoryHistory(id),
  }),
  createInventoryItem: async (input: CreateInventoryInput) => ({
    item: store.createInventoryItem(input),
  }),
  updateInventoryItem: async (id: string, patch: Parameters<typeof store.updateInventoryItem>[1]) => ({
    item: store.updateInventoryItem(id, patch),
  }),
  deleteInventoryItem: async (id: string) => {
    store.deleteInventoryItem(id);
    return { ok: true as const };
  },
  consume: async (id: string, amount: number, note?: string) => ({
    item: store.consumeInventoryItem(id, amount, { note }),
  }),
  adjust: async (id: string, amount: number, note?: string) => ({
    item: store.adjustInventoryItem(id, amount, note),
  }),
  usedUp: async (id: string) => ({ item: store.discardInventoryItem(id, "使い切った") }),
  restock: async (id: string, amount: number, note?: string) => ({
    item: store.restockInventoryItem(id, amount, note),
  }),

  listRules: async () => ({ rules: store.listConsumptionRules() }),
  createRule: async (input: CreateRuleInput) => ({ rule: store.createConsumptionRule(input) }),
  updateRule: async (id: string, patch: Parameters<typeof store.updateConsumptionRule>[1]) => ({
    rule: store.updateConsumptionRule(id, patch),
  }),
  deleteRule: async (id: string) => {
    store.deleteConsumptionRule(id);
    return { ok: true as const };
  },
  pauseRule: async (id: string) => ({ rule: store.setRuleActive(id, false) }),
  resumeRule: async (id: string) => ({ rule: store.setRuleActive(id, true) }),
  runDueRules: async () => store.runDueConsumptionRules(),

  recipeRecommendations: async () => ({ recommendations: store.recommendRecipes() }),
  getRecipe: async (id: string): Promise<RecipeMatch> => store.getRecipeMatch(id),
  completeRecipe: async (id: string, servingsMultiplier = 1) =>
    store.completeRecipe(id, servingsMultiplier),

  resetDemoData: async () => {
    const { resetDb } = await import("./db");
    resetDb();
    return { ok: true as const };
  },
};

export type { ConsumptionRule, Recipe, RecipeMatch };
