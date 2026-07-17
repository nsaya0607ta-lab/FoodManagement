import { UnitDef, UnitKind } from "./types";

// 設計書10.1: 対応単位。内部的には基本単位（ml / g / 個 / 枚）に変換して保持する。
export const UNIT_DEFS: UnitDef[] = [
  { unit: "個", kind: "count", toBase: 1 },
  { unit: "本", kind: "count", toBase: 1 },
  { unit: "袋", kind: "count", toBase: 1 },
  { unit: "パック", kind: "count", toBase: 1 },
  { unit: "玉", kind: "count", toBase: 1 },
  { unit: "丁", kind: "count", toBase: 1 },
  { unit: "缶", kind: "count", toBase: 1 },
  { unit: "合", kind: "count", toBase: 1 },
  { unit: "枚", kind: "sheet", toBase: 1 },
  { unit: "ml", kind: "volume", toBase: 1 },
  { unit: "L", kind: "volume", toBase: 1000 },
  { unit: "g", kind: "weight", toBase: 1 },
  { unit: "kg", kind: "weight", toBase: 1000 },
];

export function getUnitDef(unit: string): UnitDef | undefined {
  return UNIT_DEFS.find((u) => u.unit === unit);
}

export function unitsForKind(kind: UnitKind): UnitDef[] {
  return UNIT_DEFS.filter((u) => u.kind === kind);
}

/** カテゴリごとの管理方式（設計書9.5）。登録画面で入力UIを自動切り替えるために使う。 */
export const CATEGORY_UNIT_KIND: Record<string, UnitKind> = {
  dairy: "volume",
  beverage: "volume",
  seasoning_liquid: "volume",
  meat: "weight",
  fish: "weight",
  grain: "weight",
  cheese_block: "weight",
  bread: "sheet",
  sliced: "sheet",
  vegetable: "count",
  fruit: "count",
  egg: "count",
  can: "count",
  other: "count",
};

export const CATEGORY_LABELS: Record<string, string> = {
  dairy: "乳製品",
  beverage: "飲料",
  seasoning_liquid: "調味料(液体)",
  meat: "肉",
  fish: "魚",
  grain: "穀物",
  cheese_block: "チーズ",
  bread: "パン",
  sliced: "スライス食品",
  vegetable: "野菜",
  fruit: "果物",
  egg: "卵",
  can: "缶詰",
  other: "その他",
};

export function defaultUnitForKind(kind: UnitKind): string {
  switch (kind) {
    case "volume":
      return "ml";
    case "weight":
      return "g";
    case "sheet":
      return "枚";
    default:
      return "個";
  }
}

export function formatAmount(amount: number, unit: string): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${rounded}${unit}`;
}
