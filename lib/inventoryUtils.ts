// fs に依存しない純粋関数。クライアントコンポーネントからも安全に import できる。
import { getUnitDef } from "./units";
import { InventoryItem } from "./types";

/** amount(fromUnit) を toUnit に変換する。種類(kind)が異なる場合は null。 */
export function convertAmount(amount: number, fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return amount;
  const from = getUnitDef(fromUnit);
  const to = getUnitDef(toUnit);
  if (!from || !to || from.kind !== to.kind) return null;
  const base = amount * from.toBase;
  return base / to.toBase;
}

/** 期限までの日数（負の場合は期限切れ） */
export function daysUntilExpiration(item: Pick<InventoryItem, "expirationDate">): number | null {
  if (!item.expirationDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(item.expirationDate + "T00:00:00");
  return Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export type StockLevel = "sufficient" | "low" | "expiring_soon" | "expired" | "unknown";

export function stockLevel(
  item: Pick<InventoryItem, "expirationDate" | "initialAmount" | "currentAmount">,
): StockLevel {
  const days = daysUntilExpiration(item);
  if (days !== null && days < 0) return "expired";
  if (days !== null && days <= 3) return "expiring_soon";
  if (item.initialAmount > 0 && item.currentAmount / item.initialAmount <= 0.2) return "low";
  return "sufficient";
}

export const STOCK_LEVEL_LABEL: Record<StockLevel, string> = {
  sufficient: "十分",
  low: "残量少",
  expiring_soon: "まもなく期限",
  expired: "期限切れ",
  unknown: "残量不明",
};

export const STOCK_LEVEL_CLASS: Record<StockLevel, string> = {
  sufficient: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  low: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  expiring_soon: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  expired: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  unknown: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};
