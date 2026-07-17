"use client";

import { useRouter } from "next/navigation";

export default function SortSelect({
  basePath,
  current,
  options,
  extraQuery,
}: {
  basePath: string;
  current: string;
  options: { value: string; label: string }[];
  extraQuery?: string;
}) {
  const router = useRouter();
  return (
    <select
      id="sort"
      defaultValue={current}
      className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      onChange={(e) => {
        const qs = new URLSearchParams(extraQuery);
        qs.set("sort", e.target.value);
        router.push(`${basePath}?${qs.toString()}`);
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
