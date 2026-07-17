"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { StorageArea } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_UNIT_KIND, defaultUnitForKind, unitsForKind } from "@/lib/units";
import { UnitKind } from "@/lib/types";

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS);

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function InventoryForm({ storageAreas }: { storageAreas: StorageArea[] }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState("vegetable");
  const [storageAreaId, setStorageAreaId] = useState(storageAreas[0]?.id ?? "refrigerator");
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState<string>(defaultUnitForKind(CATEGORY_UNIT_KIND["vegetable"]));
  const [purchaseDate, setPurchaseDate] = useState(todayIso());
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [expirationUnknown, setExpirationUnknown] = useState(false);
  const [managementType, setManagementType] = useState<"normal" | "free_consumption">("normal");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kind: UnitKind = CATEGORY_UNIT_KIND[category] ?? "count";
  const unitOptions = useMemo(() => unitsForKind(kind), [kind]);

  const onCategoryChange = (value: string) => {
    setCategory(value);
    const newKind = CATEGORY_UNIT_KIND[value] ?? "count";
    setUnit(defaultUnitForKind(newKind));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) {
      setError("食材名を入力してください。");
      return;
    }
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      setError("数量は0以上の数値を入力してください。");
      return;
    }
    if (hasExpiration && !expirationUnknown && !expirationDate) {
      setError("賞味期限・消費期限を入力するか、「不明」を選択してください。");
      return;
    }
    setBusy(true);
    try {
      const item = await api.createInventoryItem({
        displayName,
        category,
        storageAreaId,
        amount: amountNum,
        amountUnit: unit,
        purchaseDate,
        expirationDate: hasExpiration && !expirationUnknown ? expirationDate : null,
        expirationType: hasExpiration && !expirationUnknown ? "user_input" : null,
        managementType,
        registrationMethod: "manual",
      });
      router.push(`/inventory/${item.item.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">食材名</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="例：玉ねぎ"
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">カテゴリ</label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">保存場所</label>
        <select
          value={storageAreaId}
          onChange={(e) => setStorageAreaId(e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {storageAreas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium">数量</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="減らす"
              onClick={() => setAmount((v) => String(Math.max(0, Number(v || 0) - 1)))}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-lg border border-zinc-300 text-lg dark:border-zinc-700"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-2 py-2 text-center dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="button"
              aria-label="増やす"
              onClick={() => setAmount((v) => String(Number(v || 0) + 1))}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-lg border border-zinc-300 text-lg dark:border-zinc-700"
            >
              ＋
            </button>
          </div>
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
        <label className="mb-1 block text-sm font-medium">購入日</label>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={hasExpiration}
            onChange={(e) => setHasExpiration(e.target.checked)}
          />
          賞味期限・消費期限を登録する（任意）
        </label>
        {hasExpiration && (
          <div className="mt-2 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={expirationUnknown}
                onChange={(e) => setExpirationUnknown(e.target.checked)}
              />
              容量・期限が不明（あとで確認する）
            </label>
            {!expirationUnknown && (
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            )}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">管理区分</label>
        <select
          value={managementType}
          onChange={(e) => setManagementType(e.target.value as "normal" | "free_consumption")}
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="normal">通常管理（レシピ・手動どちらでも消費）</option>
          <option value="free_consumption">自由消費用（自動消費ルールで消費する牛乳など）</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="min-h-[44px] rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {busy ? "登録中..." : "この内容で登録する"}
      </button>
    </form>
  );
}
