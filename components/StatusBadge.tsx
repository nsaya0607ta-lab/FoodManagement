import { STOCK_LEVEL_CLASS, STOCK_LEVEL_LABEL, StockLevel } from "@/lib/inventoryUtils";

export default function StatusBadge({ level }: { level: StockLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STOCK_LEVEL_CLASS[level]}`}
    >
      {STOCK_LEVEL_LABEL[level]}
    </span>
  );
}
