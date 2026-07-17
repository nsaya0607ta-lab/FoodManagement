import Link from "next/link";
import { notFound } from "next/navigation";
import ItemCard from "@/components/ItemCard";
import SortSelect from "@/components/SortSelect";
import { daysUntilExpiration, listStorageAreas, stockLevel } from "@/lib/store";
import { InventoryItem } from "@/lib/types";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type SortKey = "expiration" | "purchase_old" | "name" | "amount_low" | "newest";

const SORT_LABEL: Record<SortKey, string> = {
  expiration: "期限が近い順",
  purchase_old: "購入日が古い順",
  name: "名前順",
  amount_low: "残量が少ない順",
  newest: "登録が新しい順",
};

type FilterKey = "expiring" | "low" | "unknown_amount";

const FILTER_LABEL: Record<FilterKey, string> = {
  expiring: "期限が近い",
  low: "残量が少ない",
  unknown_amount: "数量不明",
};

function sortItems(items: InventoryItem[], sort: SortKey): InventoryItem[] {
  const copy = [...items];
  switch (sort) {
    case "expiration":
      return copy.sort((a, b) => (daysUntilExpiration(a) ?? 9999) - (daysUntilExpiration(b) ?? 9999));
    case "purchase_old":
      return copy.sort((a, b) => (a.purchaseDate < b.purchaseDate ? -1 : 1));
    case "name":
      return copy.sort((a, b) => a.displayName.localeCompare(b.displayName, "ja"));
    case "amount_low":
      return copy.sort(
        (a, b) =>
          (a.initialAmount > 0 ? a.currentAmount / a.initialAmount : 1) -
          (b.initialAmount > 0 ? b.currentAmount / b.initialAmount : 1),
      );
    case "newest":
      return copy.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    default:
      return copy;
  }
}

export default async function StorageAreaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string; f?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const areas = listStorageAreas();
  const area = areas.find((a) => a.id === id);
  if (!area) notFound();

  const db = readDb();
  let items = db.inventoryItems.filter((i) => i.storageAreaId === id && i.status === "active");

  const activeFilters = new Set((sp.f ?? "").split(",").filter(Boolean) as FilterKey[]);
  if (activeFilters.has("expiring")) {
    items = items.filter((i) => stockLevel(i) === "expiring_soon" || stockLevel(i) === "expired");
  }
  if (activeFilters.has("low")) {
    items = items.filter((i) => stockLevel(i) === "low");
  }
  if (activeFilters.has("unknown_amount")) {
    items = items.filter((i) => i.expirationDate === null);
  }

  const sort = (sp.sort as SortKey) ?? "expiration";
  items = sortItems(items, sort);

  const toggleFilterHref = (key: FilterKey) => {
    const next = new Set(activeFilters);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    const qs = new URLSearchParams();
    if (sp.sort) qs.set("sort", sp.sort);
    if (next.size > 0) qs.set("f", Array.from(next).join(","));
    return `/storage/${id}?${qs.toString()}`;
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <div className="flex items-center gap-2">
        <Link href="/storage" className="text-sm text-zinc-500 hover:underline">
          ← 保存場所一覧
        </Link>
      </div>
      <h1 className="text-lg font-bold">{area.name}</h1>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {(Object.keys(FILTER_LABEL) as FilterKey[]).map((key) => (
          <Link
            key={key}
            href={toggleFilterHref(key)}
            className={`rounded-full border px-3 py-1 ${
              activeFilters.has(key)
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {FILTER_LABEL[key]}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <label htmlFor="sort" className="text-zinc-500">
          並び替え
        </label>
        <SortSelect
          basePath={`/storage/${id}`}
          current={sort}
          extraQuery={sp.f ? `f=${sp.f}` : ""}
          options={(Object.keys(SORT_LABEL) as SortKey[]).map((key) => ({
            value: key,
            label: SORT_LABEL[key],
          }))}
        />
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-500">この保存場所に食材はありません。</p>
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
