"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { InventoryItem } from "@/lib/types";
import { unitsForKind, getUnitDef } from "@/lib/units";
import { DOW_LABELS, RECURRENCE_OPTIONS, SHORTAGE_ACTION_LABEL } from "@/lib/ruleLabels";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function RuleForm({ items }: { items: InventoryItem[] }) {
  const router = useRouter();
  const [inventoryItemId, setInventoryItemId] = useState(items[0]?.id ?? "");
  const selectedItem = items.find((i) => i.id === inventoryItemId);

  const [name, setName] = useState("");
  const [consumeAmount, setConsumeAmount] = useState("1");
  const [unit, setUnit] = useState(selectedItem?.amountUnit ?? "個");
  const [recurrenceType, setRecurrenceType] = useState<
    "daily" | "weekdays" | "weekends" | "weekly_days" | "interval_days" | "once"
  >("daily");
  const [weeklyDays, setWeeklyDays] = useState<number[]>([1]);
  const [intervalDays, setIntervalDays] = useState("2");
  const [executionTime, setExecutionTime] = useState("08:00");
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState("");
  const [shortageAction, setShortageAction] = useState<
    "zero_and_notify" | "skip_and_notify" | "disallow_negative" | "pause_rule"
  >("zero_and_notify");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unitOptions = useMemo(() => {
    if (!selectedItem) return [];
    const def = getUnitDef(selectedItem.amountUnit);
    return def ? unitsForKind(def.kind) : [];
  }, [selectedItem]);

  const onSelectItem = (id: string) => {
    setInventoryItemId(id);
    const item = items.find((i) => i.id === id);
    if (item) setUnit(item.amountUnit);
  };

  const toggleDay = (d: number) => {
    setWeeklyDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!inventoryItemId) {
      setError("対象食材を選択してください。");
      return;
    }
    if (!name.trim()) {
      setError("ルール名を入力してください。");
      return;
    }
    const amountNum = Number(consumeAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError("消費量は0より大きい数値を入力してください。");
      return;
    }
    if (recurrenceType === "weekly_days" && weeklyDays.length === 0) {
      setError("曜日を1つ以上選択してください。");
      return;
    }
    setBusy(true);
    try {
      await api.createRule({
        inventoryItemId,
        name,
        consumeAmount: amountNum,
        amountUnit: unit,
        recurrenceType,
        recurrenceValue:
          recurrenceType === "weekly_days"
            ? weeklyDays
            : recurrenceType === "interval_days"
              ? Number(intervalDays)
              : null,
        executionTime,
        startDate,
        endDate: endDate || null,
        shortageAction,
      });
      router.push("/rules");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        対象にできる食材がありません。先に食材を登録してください。
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">ルール名</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：朝の牛乳"
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">対象食材</label>
        <select
          value={inventoryItemId}
          onChange={(e) => onSelectItem(e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.displayName}（残 {i.currentAmount}
              {i.amountUnit}）
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium">消費量</label>
          <input
            type="number"
            min={0}
            step="any"
            value={consumeAmount}
            onChange={(e) => setConsumeAmount(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">単位</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {unitOptions.map((u) => (
              <option key={u.unit} value={u.unit}>
                {u.unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">繰り返し方法</label>
        <select
          value={recurrenceType}
          onChange={(e) => setRecurrenceType(e.target.value as typeof recurrenceType)}
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {RECURRENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {recurrenceType === "weekly_days" && (
        <div>
          <label className="mb-1 block text-sm font-medium">曜日</label>
          <div className="flex gap-1.5">
            {DOW_LABELS.map((label, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => toggleDay(idx)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${
                  weeklyDays.includes(idx)
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {recurrenceType === "interval_days" && (
        <div>
          <label className="mb-1 block text-sm font-medium">間隔（日）</label>
          <input
            type="number"
            min={1}
            value={intervalDays}
            onChange={(e) => setIntervalDays(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">実行時刻</label>
        <input
          type="time"
          value={executionTime}
          onChange={(e) => setExecutionTime(e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium">開始日</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">終了日（任意）</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">在庫不足時の動作</label>
        <select
          value={shortageAction}
          onChange={(e) => setShortageAction(e.target.value as typeof shortageAction)}
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {(Object.keys(SHORTAGE_ACTION_LABEL) as (keyof typeof SHORTAGE_ACTION_LABEL)[]).map((key) => (
            <option key={key} value={key}>
              {SHORTAGE_ACTION_LABEL[key]}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="min-h-[44px] rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {busy ? "作成中..." : "ルールを保存"}
      </button>
    </form>
  );
}
