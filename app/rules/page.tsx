import Link from "next/link";
import RuleActions from "@/components/RuleActions";
import { formatRecurrence } from "@/lib/ruleLabels";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatAmount(amount: number, unit: string): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${rounded}${unit}`;
}

export default async function RulesPage() {
  const db = readDb();
  const rules = [...db.consumptionRules].sort((a, b) => (a.nextExecutionAt < b.nextExecutionAt ? -1 : 1));

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">自動消費ルール</h1>
        <Link
          href="/rules/new"
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          ＋ ルールを追加
        </Link>
      </div>

      {rules.length === 0 ? (
        <p className="text-sm text-zinc-500">
          自動消費ルールはまだありません。「毎朝牛乳を100ml飲む」のような日常消費を登録できます。
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {rules.map((rule) => {
            const item = db.inventoryItems.find((i) => i.id === rule.inventoryItemId);
            return (
              <div
                key={rule.id}
                className={`rounded-xl border p-3 shadow-sm dark:border-zinc-800 ${
                  rule.isActive
                    ? "border-zinc-200 bg-white dark:bg-zinc-900"
                    : "border-zinc-200 bg-zinc-50 opacity-70 dark:bg-zinc-900/50"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium">{rule.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      rule.isActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {rule.isActive ? "有効" : "一時停止中"}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {item?.displayName ?? "(食材不明)"} を {formatRecurrence(rule)} {rule.executionTime} に{" "}
                  {formatAmount(rule.consumeAmount, rule.amountUnit)} 消費
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  次回実行: {new Date(rule.nextExecutionAt).toLocaleString("ja-JP")}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Link href={`/inventory/${rule.inventoryItemId}`} className="text-xs text-emerald-700 underline dark:text-emerald-400">
                    対象食材を見る
                  </Link>
                  <RuleActions rule={rule} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
