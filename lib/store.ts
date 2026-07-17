import { readDb, writeDb, generateId, nowIso, Database } from "./db";
import { convertAmount, daysUntilExpiration, stockLevel, StockLevel } from "./inventoryUtils";
import {
  ConsumptionRule,
  InventoryItem,
  InventoryTransaction,
  ManagementType,
  Recipe,
  RegistrationMethod,
  RunDueRulesResult,
  SourceType,
  StorageArea,
} from "./types";

export class InsufficientStockError extends Error {}
export class NotFoundError extends Error {}

export { convertAmount, daysUntilExpiration, stockLevel };
export type { StockLevel };

/* ------------------------------------------------------------------ */
/* 保存場所                                                            */
/* ------------------------------------------------------------------ */

export function listStorageAreas(): StorageArea[] {
  return readDb().storageAreas.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getStorageAreaInventory(storageAreaId: string): InventoryItem[] {
  const db = readDb();
  return db.inventoryItems.filter(
    (i) => i.storageAreaId === storageAreaId && i.status === "active",
  );
}

export function getStorageAreaCounts(): Record<string, number> {
  const db = readDb();
  const counts: Record<string, number> = {};
  for (const item of db.inventoryItems) {
    if (item.status !== "active") continue;
    counts[item.storageAreaId] = (counts[item.storageAreaId] ?? 0) + 1;
  }
  return counts;
}

/* ------------------------------------------------------------------ */
/* 在庫                                                                */
/* ------------------------------------------------------------------ */

export interface CreateInventoryInput {
  displayName: string;
  category: string;
  storageAreaId: string;
  amount: number;
  amountUnit: string;
  purchaseDate: string;
  expirationDate?: string | null;
  expirationType?: InventoryItem["expirationType"];
  isEstimatedExpiration?: boolean;
  managementType?: ManagementType;
  registrationMethod?: RegistrationMethod;
}

export function listInventory(): InventoryItem[] {
  return readDb().inventoryItems.filter((i) => i.status === "active");
}

export function getInventoryItem(id: string): InventoryItem {
  const db = readDb();
  const item = db.inventoryItems.find((i) => i.id === id);
  if (!item) throw new NotFoundError(`inventory item not found: ${id}`);
  return item;
}

export function getInventoryHistory(id: string): InventoryTransaction[] {
  const db = readDb();
  return db.transactions
    .filter((t) => t.inventoryItemId === id)
    .sort((a, b) => (a.executedAt < b.executedAt ? 1 : -1));
}

export function createInventoryItem(input: CreateInventoryInput): InventoryItem {
  if (input.amount < 0) throw new Error("amount must not be negative");
  if (!input.displayName.trim()) throw new Error("displayName is required");
  const db = readDb();
  const now = nowIso();
  const item: InventoryItem = {
    id: generateId(),
    displayName: input.displayName.trim(),
    category: input.category,
    storageAreaId: input.storageAreaId,
    managementType: input.managementType ?? "normal",
    initialAmount: input.amount,
    currentAmount: input.amount,
    amountUnit: input.amountUnit,
    purchaseDate: input.purchaseDate,
    openedDate: null,
    expirationDate: input.expirationDate ?? null,
    expirationType: input.expirationType ?? (input.expirationDate ? "user_input" : null),
    isEstimatedExpiration: input.isEstimatedExpiration ?? false,
    registrationMethod: input.registrationMethod ?? "manual",
    status: "active",
    imageUrl: null,
    createdAt: now,
    updatedAt: now,
  };
  db.inventoryItems.push(item);
  const txn: InventoryTransaction = {
    id: generateId(),
    inventoryItemId: item.id,
    transactionType: "purchase",
    amountBefore: 0,
    changeAmount: input.amount,
    amountAfter: input.amount,
    sourceType: "manual",
    sourceId: null,
    note: "手動登録",
    executedAt: now,
  };
  db.transactions.push(txn);
  writeDb(db);
  return item;
}

export function updateInventoryItem(
  id: string,
  patch: Partial<
    Pick<
      InventoryItem,
      | "displayName"
      | "storageAreaId"
      | "expirationDate"
      | "expirationType"
      | "openedDate"
      | "managementType"
    >
  >,
): InventoryItem {
  const db = readDb();
  const item = db.inventoryItems.find((i) => i.id === id);
  if (!item) throw new NotFoundError(`inventory item not found: ${id}`);
  Object.assign(item, patch, { updatedAt: nowIso() });
  writeDb(db);
  return item;
}

function applyTransaction(
  db: Database,
  item: InventoryItem,
  transactionType: InventoryTransaction["transactionType"],
  changeAmount: number,
  sourceType: SourceType,
  sourceId: string | null,
  note: string | null,
): InventoryTransaction {
  const before = item.currentAmount;
  let after = before + changeAmount;
  if (after < 0) after = 0;
  item.currentAmount = after;
  item.updatedAt = nowIso();
  if (after === 0 && transactionType !== "purchase") {
    item.status = transactionType === "discard" ? "discarded" : "consumed";
  }
  const txn: InventoryTransaction = {
    id: generateId(),
    inventoryItemId: item.id,
    transactionType,
    amountBefore: before,
    changeAmount: after - before,
    amountAfter: after,
    sourceType,
    sourceId,
    note,
    executedAt: nowIso(),
  };
  db.transactions.push(txn);
  return txn;
}

/** 使用量を入力して在庫を減らす（設計書9.9） */
export function consumeInventoryItem(
  id: string,
  amount: number,
  opts: { sourceType?: SourceType; sourceId?: string | null; note?: string | null } = {},
): InventoryItem {
  if (amount <= 0) throw new Error("amount must be positive");
  const db = readDb();
  const item = db.inventoryItems.find((i) => i.id === id);
  if (!item) throw new NotFoundError(`inventory item not found: ${id}`);
  applyTransaction(
    db,
    item,
    "consume",
    -amount,
    opts.sourceType ?? "manual",
    opts.sourceId ?? null,
    opts.note ?? "使用",
  );
  writeDb(db);
  return item;
}

/** 現在量を直接入力して修正する */
export function adjustInventoryItem(id: string, newAmount: number, note?: string): InventoryItem {
  if (newAmount < 0) throw new Error("amount must not be negative");
  const db = readDb();
  const item = db.inventoryItems.find((i) => i.id === id);
  if (!item) throw new NotFoundError(`inventory item not found: ${id}`);
  const change = newAmount - item.currentAmount;
  applyTransaction(db, item, "adjust", change, "manual", null, note ?? "残量修正");
  if (newAmount > 0) item.status = "active";
  writeDb(db);
  return item;
}

/** 買い足した（在庫を追加する） */
export function restockInventoryItem(id: string, amount: number, note?: string): InventoryItem {
  if (amount <= 0) throw new Error("amount must be positive");
  const db = readDb();
  const item = db.inventoryItems.find((i) => i.id === id);
  if (!item) throw new NotFoundError(`inventory item not found: ${id}`);
  applyTransaction(db, item, "restore", amount, "manual", null, note ?? "買い足し");
  item.status = "active";
  item.initialAmount += amount;
  writeDb(db);
  return item;
}

/** 使い切った／廃棄した */
export function discardInventoryItem(id: string, note?: string): InventoryItem {
  const db = readDb();
  const item = db.inventoryItems.find((i) => i.id === id);
  if (!item) throw new NotFoundError(`inventory item not found: ${id}`);
  applyTransaction(db, item, "discard", -item.currentAmount, "manual", null, note ?? "廃棄");
  writeDb(db);
  return item;
}

export function deleteInventoryItem(id: string): void {
  const db = readDb();
  const item = db.inventoryItems.find((i) => i.id === id);
  if (!item) throw new NotFoundError(`inventory item not found: ${id}`);
  item.status = "deleted";
  item.updatedAt = nowIso();
  writeDb(db);
}

/* ------------------------------------------------------------------ */
/* 自動消費ルール                                                       */
/* ------------------------------------------------------------------ */

export interface CreateRuleInput {
  inventoryItemId: string;
  name: string;
  consumeAmount: number;
  amountUnit: string;
  recurrenceType: ConsumptionRule["recurrenceType"];
  recurrenceValue?: number[] | number | null;
  executionTime: string;
  startDate: string;
  endDate?: string | null;
  shortageAction?: ConsumptionRule["shortageAction"];
}

export function listConsumptionRules(): ConsumptionRule[] {
  return readDb().consumptionRules;
}

export function getConsumptionRule(id: string): ConsumptionRule {
  const rule = readDb().consumptionRules.find((r) => r.id === id);
  if (!rule) throw new NotFoundError(`rule not found: ${id}`);
  return rule;
}

export function computeNextExecution(
  rule: Pick<
    ConsumptionRule,
    "recurrenceType" | "recurrenceValue" | "executionTime" | "startDate" | "endDate"
  >,
  after: Date,
): string | null {
  const [h, m] = rule.executionTime.split(":").map(Number);
  const start = new Date(rule.startDate + "T00:00:00");
  const candidate = new Date(after);
  candidate.setHours(h, m, 0, 0);
  if (candidate.getTime() <= after.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(h, m, 0, 0);
  }
  if (candidate < start) {
    candidate.setTime(start.getTime());
    candidate.setHours(h, m, 0, 0);
  }

  const matchesDay = (d: Date): boolean => {
    const dow = d.getDay();
    switch (rule.recurrenceType) {
      case "daily":
      case "once":
      case "interval_days":
        return true;
      case "weekdays":
        return dow >= 1 && dow <= 5;
      case "weekends":
        return dow === 0 || dow === 6;
      case "weekly_days":
        return Array.isArray(rule.recurrenceValue) && rule.recurrenceValue.includes(dow);
      default:
        return true;
    }
  };

  for (let i = 0; i < 366; i++) {
    if (matchesDay(candidate)) break;
    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(h, m, 0, 0);
  }

  if (rule.endDate) {
    const end = new Date(rule.endDate + "T23:59:59");
    if (candidate > end) return null;
  }
  return candidate.toISOString();
}

export function createConsumptionRule(input: CreateRuleInput): ConsumptionRule {
  if (input.consumeAmount <= 0) throw new Error("consumeAmount must be positive");
  if (!input.name.trim()) throw new Error("name is required");
  const db = readDb();
  const item = db.inventoryItems.find((i) => i.id === input.inventoryItemId);
  if (!item) throw new NotFoundError(`inventory item not found: ${input.inventoryItemId}`);
  const now = nowIso();
  const next = computeNextExecution(
    {
      recurrenceType: input.recurrenceType,
      recurrenceValue: input.recurrenceValue ?? null,
      executionTime: input.executionTime,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
    },
    new Date(),
  );
  const rule: ConsumptionRule = {
    id: generateId(),
    inventoryItemId: input.inventoryItemId,
    name: input.name.trim(),
    consumeAmount: input.consumeAmount,
    amountUnit: input.amountUnit,
    recurrenceType: input.recurrenceType,
    recurrenceValue: input.recurrenceValue ?? null,
    executionTime: input.executionTime,
    startDate: input.startDate,
    endDate: input.endDate ?? null,
    nextExecutionAt: next ?? new Date(8640000000000000).toISOString(),
    shortageAction: input.shortageAction ?? "zero_and_notify",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  db.consumptionRules.push(rule);
  writeDb(db);
  return rule;
}

export function updateConsumptionRule(
  id: string,
  patch: Partial<CreateRuleInput> & { isActive?: boolean },
): ConsumptionRule {
  const db = readDb();
  const rule = db.consumptionRules.find((r) => r.id === id);
  if (!rule) throw new NotFoundError(`rule not found: ${id}`);
  Object.assign(rule, patch);
  if (
    patch.recurrenceType ||
    patch.recurrenceValue !== undefined ||
    patch.executionTime ||
    patch.startDate ||
    patch.endDate !== undefined
  ) {
    const next = computeNextExecution(rule, new Date());
    rule.nextExecutionAt = next ?? new Date(8640000000000000).toISOString();
  }
  rule.updatedAt = nowIso();
  writeDb(db);
  return rule;
}

export function setRuleActive(id: string, isActive: boolean): ConsumptionRule {
  return updateConsumptionRule(id, { isActive });
}

export function deleteConsumptionRule(id: string): void {
  const db = readDb();
  const idx = db.consumptionRules.findIndex((r) => r.id === id);
  if (idx === -1) throw new NotFoundError(`rule not found: ${id}`);
  db.consumptionRules.splice(idx, 1);
  writeDb(db);
}

/**
 * 期限を過ぎた有効なルールを実行する（設計書16章）。
 * nextExecutionAt を実行直後に進めることで、同一予定時刻の二重実行を防ぐ（冪等性）。
 */
export function runDueConsumptionRules(): RunDueRulesResult {
  const db = readDb();
  const now = new Date();
  const executed: RunDueRulesResult["executed"] = [];

  for (const rule of db.consumptionRules) {
    if (!rule.isActive) continue;
    let guard = 0;
    while (new Date(rule.nextExecutionAt).getTime() <= now.getTime() && guard < 50) {
      guard += 1;
      const item = db.inventoryItems.find((i) => i.id === rule.inventoryItemId);
      const dueAt = new Date(rule.nextExecutionAt);
      const next = computeNextExecution(rule, dueAt);
      if (!item || item.status !== "active") {
        rule.nextExecutionAt = next ?? new Date(8640000000000000).toISOString();
        if (!next) rule.isActive = false;
        continue;
      }
      const converted = convertAmount(rule.consumeAmount, rule.amountUnit, item.amountUnit);
      const amount = converted ?? rule.consumeAmount;
      const shortage = item.currentAmount < amount;
      if (shortage && rule.shortageAction === "pause_rule") {
        rule.isActive = false;
        break;
      }
      if (shortage && rule.shortageAction === "skip_and_notify") {
        // 実行せずスキップし、次回に進める
      } else {
        applyTransaction(
          db,
          item,
          "consume",
          -amount,
          "consumption_rule",
          rule.id,
          `自動消費: ${rule.name}`,
        );
      }
      executed.push({ ruleId: rule.id, itemId: item.id, amount, shortage });
      rule.nextExecutionAt = next ?? new Date(8640000000000000).toISOString();
      rule.updatedAt = nowIso();
      if (!next) rule.isActive = false;
    }
  }

  writeDb(db);
  return { executed };
}

/* ------------------------------------------------------------------ */
/* レシピ                                                              */
/* ------------------------------------------------------------------ */

export function listRecipes(): Recipe[] {
  return readDb().recipes;
}

export function getRecipe(id: string): Recipe {
  const recipe = readDb().recipes.find((r) => r.id === id);
  if (!recipe) throw new NotFoundError(`recipe not found: ${id}`);
  return recipe;
}

export interface IngredientAvailability {
  ingredientId: string;
  name: string;
  category: string;
  requiredAmount: number;
  requiredUnit: string;
  availableAmount: number;
  isOptional: boolean;
  sufficient: boolean;
  matchedItemIds: string[];
}

export interface RecipeMatch {
  recipe: Recipe;
  matchRate: number; // 0-100
  score: number;
  shortageIngredients: IngredientAvailability[];
  availability: IngredientAvailability[];
  canCookWithoutShopping: boolean;
  usesExpiringItems: boolean;
}

/**
 * 食材（在庫アイテム）がレシピ材料に該当するかを判定する。
 * カテゴリだけで突合すると「ハム」と「スライスチーズ」のように同一カテゴリ内の
 * 別食品まで在庫として合算されてしまうため、食品名の一致（部分一致）で判定する。
 */
function matchesIngredient(item: InventoryItem, ingredientName: string): boolean {
  return item.displayName.includes(ingredientName) || ingredientName.includes(item.displayName);
}

function ingredientAvailability(db: Database, recipe: Recipe): IngredientAvailability[] {
  const activeItems = db.inventoryItems.filter((i) => i.status === "active");
  return recipe.ingredients.map((ing) => {
    const candidates = activeItems.filter(
      (i) => i.category === ing.category && matchesIngredient(i, ing.name),
    );
    let available = 0;
    const matchedItemIds: string[] = [];
    for (const candidate of candidates) {
      const converted = convertAmount(candidate.currentAmount, candidate.amountUnit, ing.amountUnit);
      if (converted === null) continue;
      available += converted;
      matchedItemIds.push(candidate.id);
    }
    return {
      ingredientId: ing.id,
      name: ing.name,
      category: ing.category,
      requiredAmount: ing.amount,
      requiredUnit: ing.amountUnit,
      availableAmount: available,
      isOptional: ing.isOptional,
      sufficient: available >= ing.amount,
      matchedItemIds,
    };
  });
}

/** 在庫一致率とスコアに基づくレシピ提案（設計書13章） */
export function recommendRecipes(): RecipeMatch[] {
  const db = readDb();
  const results: RecipeMatch[] = db.recipes.map((recipe) => {
    const availability = ingredientAvailability(db, recipe);
    const required = availability.filter((a) => !a.isOptional);
    const satisfied = required.filter((a) => a.sufficient).length;
    const matchRate = required.length === 0 ? 100 : Math.round((satisfied / required.length) * 100);
    const shortageIngredients = availability.filter((a) => !a.sufficient && !a.isOptional);
    const canCookWithoutShopping = shortageIngredients.length === 0;

    const expiringUsed = availability.some((a) =>
      a.matchedItemIds.some((id) => {
        const item = db.inventoryItems.find((i) => i.id === id);
        return item ? stockLevel(item) === "expiring_soon" : false;
      }),
    );

    const cookingTimeScore = Math.max(0, 100 - recipe.cookingTimeMinutes * 2);
    const score =
      matchRate * 0.45 +
      (expiringUsed ? 100 : 0) * 0.25 +
      50 * 0.1 + // ユーザー嗜好一致率（MVPでは未実装のため中立値）
      cookingTimeScore * 0.1 +
      (canCookWithoutShopping ? 100 : 0) * 0.1;

    return {
      recipe,
      matchRate,
      score: Math.round(score * 10) / 10,
      shortageIngredients,
      availability,
      canCookWithoutShopping,
      usesExpiringItems: expiringUsed,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

export function getRecipeMatch(recipeId: string): RecipeMatch {
  const all = recommendRecipes();
  const found = all.find((m) => m.recipe.id === recipeId);
  if (!found) throw new NotFoundError(`recipe not found: ${recipeId}`);
  return found;
}

export interface RecipeCompletionResult {
  updatedItems: { itemId: string; name: string; before: number; after: number; unit: string }[];
  emptiedItems: { itemId: string; name: string }[];
}

/**
 * レシピを実行し、材料を在庫から一括で減らす（設計書9.14, 13章）。
 * 一つの読み書きトランザクション内で全材料を処理し、途中失敗時は反映しない。
 */
export function completeRecipe(recipeId: string, servingsMultiplier = 1): RecipeCompletionResult {
  const db = readDb();
  const recipe = db.recipes.find((r) => r.id === recipeId);
  if (!recipe) throw new NotFoundError(`recipe not found: ${recipeId}`);

  const updatedItems: RecipeCompletionResult["updatedItems"] = [];
  const emptiedItems: RecipeCompletionResult["emptiedItems"] = [];

  for (const ing of recipe.ingredients) {
    let remaining = ing.amount * servingsMultiplier;
    if (remaining <= 0) continue;
    const candidates = db.inventoryItems.filter(
      (i) => i.status === "active" && i.category === ing.category && matchesIngredient(i, ing.name),
    );
    for (const item of candidates) {
      if (remaining <= 0) break;
      const converted = convertAmount(remaining, ing.amountUnit, item.amountUnit);
      if (converted === null) continue;
      const takeInItemUnit = Math.min(converted, item.currentAmount);
      if (takeInItemUnit <= 0) continue;
      const before = item.currentAmount;
      applyTransaction(db, item, "consume", -takeInItemUnit, "recipe", recipe.id, `調理: ${recipe.name}`);
      updatedItems.push({
        itemId: item.id,
        name: item.displayName,
        before,
        after: item.currentAmount,
        unit: item.amountUnit,
      });
      if (item.currentAmount === 0) {
        emptiedItems.push({ itemId: item.id, name: item.displayName });
      }
      const takenInRecipeUnit = convertAmount(takeInItemUnit, item.amountUnit, ing.amountUnit) ?? 0;
      remaining -= takenInRecipeUnit;
    }
  }

  writeDb(db);
  return { updatedItems, emptiedItems };
}
