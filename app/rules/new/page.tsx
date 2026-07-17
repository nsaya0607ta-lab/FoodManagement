"use client";

import Link from "next/link";
import RuleForm from "@/components/RuleForm";
import { listInventory } from "@/lib/store";
import { useLocalDb } from "@/lib/useLocalDb";

export default function NewRulePage() {
  const db = useLocalDb();

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <Link href="/rules" className="text-sm text-zinc-500 hover:underline">
        ← 自動消費ルール一覧
      </Link>
      <h1 className="text-lg font-bold">自動消費ルールを作成</h1>
      {!db ? (
        <p className="py-8 text-center text-sm text-zinc-500">読み込み中...</p>
      ) : (
        <RuleForm items={listInventory()} />
      )}
    </div>
  );
}
