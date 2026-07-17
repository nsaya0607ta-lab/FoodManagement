"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { ConsumptionRule } from "@/lib/types";

export default function RuleActions({ rule }: { rule: ConsumptionRule }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      if (rule.isActive) await api.pauseRule(rule.id);
      else await api.resumeRule(rule.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`「${rule.name}」を削除しますか？`)) return;
    setBusy(true);
    try {
      await api.deleteRule(rule.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-2 text-sm">
      <button
        onClick={toggle}
        disabled={busy}
        className="min-h-[36px] rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {rule.isActive ? "一時停止" : "再開"}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="min-h-[36px] rounded-lg border border-red-300 px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/40"
      >
        削除
      </button>
    </div>
  );
}
