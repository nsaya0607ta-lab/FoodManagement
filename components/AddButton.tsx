"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AddButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/inventory/new")) return null;
  return (
    <Link
      href="/inventory/new"
      aria-label="食材を登録"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white shadow-lg hover:bg-emerald-700 active:scale-95 sm:right-[calc(50%-14rem)]"
    >
      ＋
    </Link>
  );
}
