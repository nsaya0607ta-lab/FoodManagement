"use client";

import type {
  ConsumptionRule,
  InventoryItem,
  InventoryTransaction,
  Recipe,
  StorageArea,
} from "./types";
import type { RecipeMatch } from "./store";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listStorageAreas: () =>
    request<{ areas: (StorageArea & { itemCount: number })[] }>("/api/storage-areas"),
  storageAreaInventory: (id: string) =>
    request<{ items: InventoryItem[] }>(`/api/storage-areas/${id}/inventory`),
  listInventory: () => request<{ items: InventoryItem[] }>("/api/inventory"),
  getInventoryItem: (id: string) =>
    request<{ item: InventoryItem; history: InventoryTransaction[] }>(`/api/inventory/${id}`),
  createInventoryItem: (input: Record<string, unknown>) =>
    request<{ item: InventoryItem }>("/api/inventory", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateInventoryItem: (id: string, patch: Record<string, unknown>) =>
    request<{ item: InventoryItem }>(`/api/inventory/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteInventoryItem: (id: string) =>
    request<{ ok: true }>(`/api/inventory/${id}`, { method: "DELETE" }),
  consume: (id: string, amount: number, note?: string) =>
    request<{ item: InventoryItem }>(`/api/inventory/${id}/consume`, {
      method: "POST",
      body: JSON.stringify({ amount, note }),
    }),
  adjust: (id: string, amount: number, note?: string) =>
    request<{ item: InventoryItem }>(`/api/inventory/${id}/adjust`, {
      method: "POST",
      body: JSON.stringify({ amount, note }),
    }),
  usedUp: (id: string) =>
    request<{ item: InventoryItem }>(`/api/inventory/${id}/adjust`, {
      method: "POST",
      body: JSON.stringify({ usedUp: true }),
    }),
  restock: (id: string, amount: number, note?: string) =>
    request<{ item: InventoryItem }>(`/api/inventory/${id}/restock`, {
      method: "POST",
      body: JSON.stringify({ amount, note }),
    }),

  listRules: () => request<{ rules: ConsumptionRule[] }>("/api/consumption-rules"),
  createRule: (input: Record<string, unknown>) =>
    request<{ rule: ConsumptionRule }>("/api/consumption-rules", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateRule: (id: string, patch: Record<string, unknown>) =>
    request<{ rule: ConsumptionRule }>(`/api/consumption-rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteRule: (id: string) =>
    request<{ ok: true }>(`/api/consumption-rules/${id}`, { method: "DELETE" }),
  pauseRule: (id: string) =>
    request<{ rule: ConsumptionRule }>(`/api/consumption-rules/${id}/pause`, { method: "POST" }),
  resumeRule: (id: string) =>
    request<{ rule: ConsumptionRule }>(`/api/consumption-rules/${id}/resume`, { method: "POST" }),
  runDueRules: () =>
    request<{ executed: unknown[] }>("/api/consumption-rules/run-due", { method: "POST" }),

  recipeRecommendations: () =>
    request<{ recommendations: RecipeMatch[] }>("/api/recipes/recommendations"),
  getRecipe: (id: string) => request<RecipeMatch>(`/api/recipes/${id}`),
  completeRecipe: (id: string, servingsMultiplier = 1) =>
    request<{
      updatedItems: { itemId: string; name: string; before: number; after: number; unit: string }[];
      emptiedItems: { itemId: string; name: string }[];
    }>(`/api/recipes/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({ servingsMultiplier }),
    }),
};

export type { Recipe };
