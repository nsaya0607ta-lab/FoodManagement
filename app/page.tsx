"use client";

import { useEffect } from "react";
import Link from "next/link";
import FridgeIllustration from "@/components/FridgeIllustration";
import ItemCard from "@/components/ItemCard";
import { daysUntilExpiration, getStorageAreaCounts, listInventory, runDueConsumptionRules } from "@/lib/store";
import { useLocalDb } from "@/lib/useLocalDb";

export default function HomePage() {
  const db = useLocalDb();

  useEffect(() => {
    // ホーム画面表示時に、期限を過ぎた自動消費ルールを実行する（16章のジョブをシミュレート）。
    // これは localStorage（外部システム）への書き込み副作用であり、コンポーネントの
    // state を直接更新するものではない。書き込み後は useLocalDb の購読により自動的に再描画される。
    runDueConsumptionRules();
  }, []);

  return (
    <div className="flex flex-col gap-5 px-4 pt-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">🧊 Reizo</h1>
        <div className="flex items-center gap-3 text-lg">
          <span aria-label="通知" title="通知">
            🔔
          </span>
          <Link href="/settings" aria-label="設定">
            ⚙️
          </Link>
        </div>
      </header>

      {!db ? (
        <p className="py-8 text-center text-sm text-zinc-500">読み込み中...</p>
      ) : (
        <HomeContent />
      )}
    </div>
  );
}

function HomeContent() {
  const counts = getStorageAreaCounts();
  const items = listInventory();

  const expiringSoon = items
    .filter((i) => {
      const d = daysUntilExpiration(i);
      return d !== null && d <= 3;
    })
    .sort((a, b) => (daysUntilExpiration(a) ?? 999) - (daysUntilExpiration(b) ?? 999))
    .slice(0, 4);

  const lowStock = items
    .filter((i) => i.initialAmount > 0 && i.currentAmount / i.initialAmount <= 0.2)
    .slice(0, 4);

  return (
    <>
      <FridgeIllustration counts={counts} />

      <div className="grid grid-cols-1 gap-2">
        <Link
          href="/inventory/new"
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          ＋ 食材を登録
        </Link>
        <Link
          href="/recipes"
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-emerald-600 px-4 py-3 font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
        >
          🍳 冷蔵庫の食材でレシピを考える
        </Link>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            期限が近い食材
          </h2>
          <Link href="/storage/expiring" className="text-xs text-emerald-700 dark:text-emerald-400">
            すべて見る
          </Link>
        </div>
        {expiringSoon.length === 0 ? (
          <p className="text-sm text-zinc-500">期限が近い食材はありません。</p>
        ) : (
          <div className="flex flex-col gap-2">
            {expiringSoon.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          残量が少ない食材
        </h2>
        {lowStock.length === 0 ? (
          <p className="text-sm text-zinc-500">残量が少ない食材はありません。</p>
        ) : (
          <div className="flex flex-col gap-2">
            {lowStock.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
