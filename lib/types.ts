// Reizo データモデル定義（設計書セクション14を簡略化して実装）

export type StorageAreaType =
  | "refrigerator"
  | "chilled"
  | "vegetable"
  | "freezer"
  | "ice"
  | "room_temperature"
  | "other";

export interface StorageArea {
  id: string;
  type: StorageAreaType;
  name: string;
  sortOrder: number;
}

// 食材の管理方式。設計書10.1に基づき、個数/容量/重量/枚数で入力UIを切り替える。
export type UnitKind = "count" | "volume" | "weight" | "sheet";

export interface UnitDef {
  unit: string;
  kind: UnitKind;
  /** baseUnit 1つあたりの倍率（例: L -> ml は1000） */
  toBase: number;
}

export type ExpirationType = "best_before" | "use_by" | "user_input" | "ai_estimated";

export type RegistrationMethod = "receipt" | "barcode" | "photo" | "manual";

export type InventoryStatus = "active" | "consumed" | "discarded" | "expired" | "deleted";

export type ManagementType = "normal" | "recipe" | "free_consumption" | "unmanaged";

export interface InventoryItem {
  id: string;
  displayName: string;
  category: string;
  storageAreaId: string;
  managementType: ManagementType;
  initialAmount: number;
  currentAmount: number;
  amountUnit: string;
  purchaseDate: string; // ISO date
  openedDate?: string | null;
  expirationDate?: string | null;
  expirationType?: ExpirationType | null;
  isEstimatedExpiration: boolean;
  registrationMethod: RegistrationMethod;
  status: InventoryStatus;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = "purchase" | "consume" | "adjust" | "discard" | "restore";
export type SourceType = "manual" | "recipe" | "consumption_rule" | "import" | "system";

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  transactionType: TransactionType;
  amountBefore: number;
  changeAmount: number;
  amountAfter: number;
  sourceType: SourceType;
  sourceId?: string | null;
  note?: string | null;
  executedAt: string;
}

export type RecurrenceType =
  | "daily"
  | "weekdays"
  | "weekends"
  | "weekly_days"
  | "interval_days"
  | "once";

export type ShortageAction =
  | "zero_and_notify"
  | "skip_and_notify"
  | "disallow_negative"
  | "pause_rule";

export interface ConsumptionRule {
  id: string;
  inventoryItemId: string;
  name: string;
  consumeAmount: number;
  amountUnit: string;
  recurrenceType: RecurrenceType;
  /** weekly_days: 0=日 ... 6=土 の配列。interval_days: 日数 */
  recurrenceValue?: number[] | number | null;
  executionTime: string; // "HH:mm"
  startDate: string;
  endDate?: string | null;
  nextExecutionAt: string; // ISO datetime
  shortageAction: ShortageAction;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  category: string;
  name: string;
  amount: number;
  amountUnit: string;
  isOptional: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  cookingTimeMinutes: number;
  difficulty: "easy" | "normal" | "hard";
  category: string;
  imageEmoji: string;
  instructions: string[];
  ingredients: RecipeIngredient[];
}

export interface RunDueRulesResult {
  executed: { ruleId: string; itemId: string; amount: number; shortage: boolean }[];
}
