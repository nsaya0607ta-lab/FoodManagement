"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";

export default function ResetDataButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const reset = async () => {
    if (!confirm("在庫データをデモ初期状態にリセットしますか？この操作は元に戻せません。")) return;
    setBusy(true);
    try {
      await api.resetDemoData();
      router.push("/");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={reset}
      disabled={busy}
      className="min-h-[44px] w-full rounded-xl border border-red-300 px-4 py-3 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/40"
    >
      {busy ? "リセット中..." : "デモデータをリセット"}
    </button>
  );
}
