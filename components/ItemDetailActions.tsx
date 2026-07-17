"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { InventoryItem, StorageArea } from "@/lib/types";

type Mode = null | "consume" | "adjust" | "restock";

export default function ItemDetailActions({
  item,
  storageAreas,
}: {
  item: InventoryItem;
  storageAreas: StorageArea[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [amount, setAmount] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setMode(null);
    setAmount("");
    setError(null);
  };

  const submit = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("正しい数値を入力してください。");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === "consume") await api.consume(item.id, value);
      if (mode === "adjust") await api.adjust(item.id, value);
      if (mode === "restock") await api.restock(item.id, value);
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const usedUp = async () => {
    if (!confirm(`${item.displayName}を使い切りましたか？`)) return;
    setBusy(true);
    try {
      await api.usedUp(item.id);
    } finally {
      setBusy(false);
    }
  };

  const changeStorage = async (storageAreaId: string) => {
    setBusy(true);
    try {
      await api.updateInventoryItem(item.id, { storageAreaId });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`${item.displayName}を削除しますか？`)) return;
    setBusy(true);
    try {
      await api.deleteInventoryItem(item.id);
      router.push("/storage");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={busy}
          onClick={() => setMode("consume")}
          className="min-h-[44px] rounded-xl bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          使用した
        </button>
        <button
          disabled={busy}
          onClick={() => setMode("restock")}
          className="min-h-[44px] rounded-xl border border-emerald-600 px-3 py-2 font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
        >
          追加した
        </button>
        <button
          disabled={busy}
          onClick={() => setMode("adjust")}
          className="min-h-[44px] rounded-xl border border-zinc-300 px-3 py-2 font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          残量を修正
        </button>
        <button
          disabled={busy}
          onClick={usedUp}
          className="min-h-[44px] rounded-xl border border-zinc-300 px-3 py-2 font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          使い切った
        </button>
      </div>

      {mode && (
        <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-2 text-sm font-medium">
            {mode === "consume" && `使用した量を入力（単位: ${item.amountUnit}）`}
            {mode === "adjust" && `現在の残量を直接入力（単位: ${item.amountUnit}）`}
            {mode === "restock" && `追加購入した量を入力（単位: ${item.amountUnit}）`}
          </p>
          <div className="flex gap-2">
            <input
              autoFocus
              type="number"
              min={0}
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="min-h-[44px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="数量"
            />
            <button
              onClick={submit}
              disabled={busy}
              className="min-h-[44px] rounded-lg bg-emerald-600 px-4 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              確定
            </button>
            <button
              onClick={close}
              className="min-h-[44px] rounded-lg border border-zinc-300 px-3 dark:border-zinc-700"
            >
              取消
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="mb-1 block text-sm font-medium">保存場所を変更</label>
        <select
          defaultValue={item.storageAreaId}
          disabled={busy}
          onChange={(e) => changeStorage(e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        >
          {storageAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={remove}
        disabled={busy}
        className="min-h-[44px] rounded-xl border border-red-300 px-3 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/40"
      >
        この食材を削除する
      </button>
    </div>
  );
}
