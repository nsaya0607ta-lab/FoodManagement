import { ConsumptionRule } from "./types";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

export function formatRecurrence(rule: Pick<ConsumptionRule, "recurrenceType" | "recurrenceValue">): string {
  switch (rule.recurrenceType) {
    case "daily":
      return "毎日";
    case "weekdays":
      return "平日のみ";
    case "weekends":
      return "週末のみ";
    case "weekly_days":
      return Array.isArray(rule.recurrenceValue)
        ? `毎週${rule.recurrenceValue.map((d) => DOW[d]).join("・")}曜`
        : "曜日指定";
    case "interval_days":
      return typeof rule.recurrenceValue === "number" ? `${rule.recurrenceValue}日ごと` : "一定日数ごと";
    case "once":
      return "1回のみ";
    default:
      return rule.recurrenceType;
  }
}

export const SHORTAGE_ACTION_LABEL: Record<ConsumptionRule["shortageAction"], string> = {
  zero_and_notify: "在庫を0にして通知",
  skip_and_notify: "処理を実行せず通知",
  disallow_negative: "マイナス在庫を許可しない",
  pause_rule: "ルールを一時停止する",
};

export const RECURRENCE_OPTIONS: { value: ConsumptionRule["recurrenceType"]; label: string }[] = [
  { value: "daily", label: "毎日" },
  { value: "weekdays", label: "平日のみ" },
  { value: "weekends", label: "週末のみ" },
  { value: "weekly_days", label: "曜日指定" },
  { value: "interval_days", label: "一定日数ごと" },
  { value: "once", label: "1回のみ" },
];

export const DOW_LABELS = DOW;
