import Link from "next/link";

interface RoomProps {
  id: string;
  label: string;
  emoji: string;
  count: number;
  className?: string;
}

function Room({ id, label, emoji, count, className = "" }: RoomProps) {
  return (
    <Link
      href={`/storage/${id}`}
      role="button"
      aria-label={`${label}（${count}品）`}
      className={`group flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-zinc-300/70 bg-zinc-100 p-3 text-center transition hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 ${className}`}
    >
      <span aria-hidden className="text-2xl">
        {emoji}
      </span>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{count}品</span>
    </Link>
  );
}

export default function FridgeIllustration({ counts }: { counts: Record<string, number> }) {
  const get = (id: string) => counts[id] ?? 0;
  return (
    <div
      aria-label="冷蔵庫"
      className="rounded-[28px] border-4 border-zinc-400 bg-gradient-to-b from-zinc-200 to-zinc-300 p-3 shadow-inner dark:border-zinc-600 dark:from-zinc-800 dark:to-zinc-900"
    >
      <div className="mb-2 flex justify-center gap-1.5">
        <span className="h-1.5 w-8 rounded-full bg-zinc-400 dark:bg-zinc-600" />
      </div>
      <div className="flex flex-col gap-2">
        <Room id="refrigerator" label="冷蔵室" emoji="🥛" count={get("refrigerator")} className="h-24" />
        <div className="grid grid-cols-2 gap-2">
          <Room id="ice" label="製氷室" emoji="🧊" count={get("ice")} />
          <Room id="chilled" label="チルド室" emoji="🧀" count={get("chilled")} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Room id="freezer" label="冷凍室" emoji="❄️" count={get("freezer")} className="h-20" />
          <Room id="vegetable" label="野菜室" emoji="🥕" count={get("vegetable")} className="h-20" />
        </div>
      </div>
    </div>
  );
}
