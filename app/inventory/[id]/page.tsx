import Link from "next/link";
import { notFound } from "next/navigation";
import ItemDetailActions from "@/components/ItemDetailActions";
import StatusBadge from "@/components/StatusBadge";
import { CATEGORY_LABELS } from "@/lib/units";
import { daysUntilExpiration, listStorageAreas, stockLevel } from "@/lib/store";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const EXPIRATION_TYPE_LABEL: Record<string, string> = {
  best_before: "賞味期限（メーカー記載）",
  use_by: "消費期限（メーカー記載）",
  user_input: "ユーザー入力",
  ai_estimated: "AI推定の保存目安",
};

const TRANSACTION_LABEL: Record<string, string> = {
  purchase: "購入・登録",
  consume: "使用",
  adjust: "残量修正",
  discard: "廃棄・使い切り",
  restore: "買い足し",
};

function formatAmount(amount: number, unit: string): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${rounded}${unit}`;
}

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = readDb();
  const item = db.inventoryItems.find((i) => i.id === id);
  if (!item) notFound();

  const history = db.transactions
    .filter((t) => t.inventoryItemId === id)
    .sort((a, b) => (a.executedAt < b.executedAt ? 1 : -1));
  const rules = db.consumptionRules.filter((r) => r.inventoryItemId === id);
  const storageAreas = listStorageAreas();
  const area = storageAreas.find((a) => a.id === item.storageAreaId);

  const days = daysUntilExpiration(item);
  const level = stockLevel(item);
  const ratio =
    item.initialAmount > 0
      ? Math.min(100, Math.round((item.currentAmount / item.initialAmount) * 100))
      : 100;

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <Link href={`/storage/${item.storageAreaId}`} className="text-sm text-zinc-500 hover:underline">
        ← {area?.name ?? "在庫"}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{item.displayName}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {CATEGORY_LABELS[item.category] ?? item.category} ・ {area?.name}
          </p>
        </div>
        <StatusBadge level={level} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-1 flex items-end justify-between">
          <span className="text-2xl font-bold">{formatAmount(item.currentAmount, item.amountUnit)}</span>
          <span className="text-sm text-zinc-500">
            購入時 {formatAmount(item.initialAmount, item.amountUnit)}（{ratio}%）
          </span>
        </div>
        <div className="progress-track h-2 w-full overflow-hidden rounded-full text-emerald-500">
          <div className="h-full rounded-full bg-current" style={{ width: `${ratio}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-zinc-500">購入日</p>
          <p className="font-medium">{item.purchaseDate}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-zinc-500">期限</p>
          <p className="font-medium">
            {item.expirationDate ?? "未設定"}
            {days !== null && ` (${days >= 0 ? `あと${days}日` : `${Math.abs(days)}日経過`})`}
          </p>
          {item.expirationType && (
            <p className="mt-0.5 text-xs text-zinc-500">
              {EXPIRATION_TYPE_LABEL[item.expirationType]}
              {item.isEstimatedExpiration && "（推定値）"}
            </p>
          )}
        </div>
      </div>

      {rules.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <p className="mb-1 font-medium text-amber-800 dark:text-amber-300">自動消費ルール</p>
          <ul className="flex flex-col gap-1">
            {rules.map((r) => (
              <li key={r.id} className="flex items-center justify-between">
                <span>
                  {r.name}（{formatAmount(r.consumeAmount, r.amountUnit)} / {r.executionTime}）
                </span>
                <Link href="/rules" className="text-emerald-700 underline dark:text-emerald-400">
                  管理
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ItemDetailActions item={item} storageAreas={storageAreas} />

      <div className="mt-2">
        <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">使用履歴</h2>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">履歴はまだありません。</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {history.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium">{TRANSACTION_LABEL[t.transactionType]}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(t.executedAt).toLocaleString("ja-JP")}
                    {t.note ? ` ・ ${t.note}` : ""}
                  </p>
                </div>
                <span className={t.changeAmount < 0 ? "text-red-600" : "text-emerald-600"}>
                  {t.changeAmount > 0 ? "+" : ""}
                  {formatAmount(t.changeAmount, item.amountUnit)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
