"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import type { RecipeMatch } from "@/lib/store";

function formatAmount(amount: number, unit: string): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${rounded}${unit}`;
}

export default function CookRecipe({ match }: { match: RecipeMatch }) {
  const [confirming, setConfirming] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof api.completeRecipe>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scaled = match.availability.map((a) => ({
    ...a,
    scaledRequired: Math.round(a.requiredAmount * multiplier * 100) / 100,
  }));

  const complete = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.completeRecipe(match.recipe.id, multiplier);
      setResult(res);
      setConfirming(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
        <p className="mb-2 font-semibold text-emerald-800 dark:text-emerald-300">
          在庫を更新しました
        </p>
        <ul className="mb-2 flex flex-col gap-1 text-sm">
          {result.updatedItems.map((u, idx) => (
            <li key={idx}>
              {u.name}: {formatAmount(u.before, u.unit)} → {formatAmount(u.after, u.unit)}
            </li>
          ))}
        </ul>
        {result.emptiedItems.length > 0 && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            使い切った食材: {result.emptiedItems.map((i) => i.name).join("・")}
          </p>
        )}
      </div>
    );
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="min-h-[44px] w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700"
      >
        このレシピを作る
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-2 font-medium">以下の食材を在庫から減らします。</p>
      <div className="mb-3 flex items-center gap-2 text-sm">
        <label>人数倍率</label>
        <button
          type="button"
          onClick={() => setMultiplier((m) => Math.max(0.5, m - 0.5))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700"
        >
          −
        </button>
        <span className="w-10 text-center">×{multiplier}</span>
        <button
          type="button"
          onClick={() => setMultiplier((m) => m + 0.5)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700"
        >
          ＋
        </button>
      </div>
      <ul className="mb-3 flex flex-col gap-1 text-sm">
        {scaled.map((s) => (
          <li key={s.ingredientId} className="flex items-center justify-between">
            <span>
              {s.name}
              {s.isOptional && <span className="ml-1 text-xs text-zinc-400">(任意)</span>}
            </span>
            <span className={s.availableAmount < s.scaledRequired ? "text-amber-600" : ""}>
              {formatAmount(s.scaledRequired, s.requiredUnit)}
              {s.availableAmount < s.scaledRequired && "（不足）"}
            </span>
          </li>
        ))}
      </ul>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={complete}
          disabled={busy}
          className="min-h-[44px] flex-1 rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "更新中..." : "在庫を更新する"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="min-h-[44px] rounded-xl border border-zinc-300 px-4 py-2 dark:border-zinc-700"
        >
          今は更新しない
        </button>
      </div>
    </div>
  );
}
