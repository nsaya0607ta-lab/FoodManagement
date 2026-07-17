import Link from "next/link";
import { InventoryItem } from "@/lib/types";
import { daysUntilExpiration, stockLevel } from "@/lib/inventoryUtils";
import StatusBadge from "./StatusBadge";

function formatAmount(amount: number, unit: string): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${rounded}${unit}`;
}

export default function ItemCard({ item }: { item: InventoryItem }) {
  const level = stockLevel(item);
  const days = daysUntilExpiration(item);
  const ratio =
    item.initialAmount > 0 ? Math.min(100, Math.round((item.currentAmount / item.initialAmount) * 100)) : 100;

  return (
    <Link
      href={`/inventory/${item.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{item.displayName}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatAmount(item.currentAmount, item.amountUnit)}
            {item.initialAmount > 0 && ` / ${formatAmount(item.initialAmount, item.amountUnit)}`}
          </p>
        </div>
        <StatusBadge level={level} />
      </div>
      <div className="progress-track mt-2 h-1.5 w-full overflow-hidden rounded-full text-emerald-500">
        <div className="h-full rounded-full bg-current" style={{ width: `${ratio}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        {days === null
          ? "期限未設定"
          : days < 0
            ? `期限切れ (${Math.abs(days)}日経過)`
            : `期限まであと${days}日`}
      </p>
    </Link>
  );
}
