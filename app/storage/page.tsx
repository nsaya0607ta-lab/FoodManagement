import Link from "next/link";
import { listStorageAreas, getStorageAreaCounts } from "@/lib/store";

export const dynamic = "force-dynamic";

const EMOJI: Record<string, string> = {
  refrigerator: "🥛",
  chilled: "🧀",
  vegetable: "🥕",
  freezer: "❄️",
  ice: "🧊",
  room_temperature: "🍞",
  other: "📦",
};

export default async function StoragePage() {
  const areas = listStorageAreas();
  const counts = getStorageAreaCounts();

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-bold">保存場所別の在庫</h1>
      <div className="flex flex-col gap-2">
        {areas.map((area) => (
          <Link
            key={area.id}
            href={`/storage/${area.id}`}
            className="flex min-h-[44px] items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="flex items-center gap-2 font-medium">
              <span aria-hidden>{EMOJI[area.type] ?? "📦"}</span>
              {area.name}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {counts[area.id] ?? 0}品
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
