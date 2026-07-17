"use client";

import Link from "next/link";
import ItemCard from "@/components/ItemCard";
import { daysUntilExpiration, listInventory } from "@/lib/store";
import { useLocalDb } from "@/lib/useLocalDb";

export default function ExpiringPage() {
  const db = useLocalDb();

  const items = db
    ? listInventory()
        .filter((i) => {
          const d = daysUntilExpiration(i);
          return d !== null && d <= 7;
        })
        .sort((a, b) => (daysUntilExpiration(a) ?? 999) - (daysUntilExpiration(b) ?? 999))
    : [];

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← ホーム
      </Link>
      <h1 className="text-lg font-bold">期限が近い食材</h1>
      {!db ? (
        <p className="py-8 text-center text-sm text-zinc-500">読み込み中...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-500">期限が近い食材はありません。</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
