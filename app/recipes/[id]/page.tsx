import Link from "next/link";
import { notFound } from "next/navigation";
import CookRecipe from "@/components/CookRecipe";
import { getRecipeMatch, NotFoundError } from "@/lib/store";

export const dynamic = "force-dynamic";

const DIFFICULTY_LABEL: Record<string, string> = { easy: "かんたん", normal: "ふつう", hard: "むずかしい" };

function formatAmount(amount: number, unit: string): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${rounded}${unit}`;
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let match;
  try {
    match = getRecipeMatch(id);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
  const { recipe } = match;

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <Link href="/recipes" className="text-sm text-zinc-500 hover:underline">
        ← レシピ提案
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden>
          {recipe.imageEmoji}
        </span>
        <div>
          <h1 className="text-lg font-bold">{recipe.name}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {recipe.cookingTimeMinutes}分 ・ {DIFFICULTY_LABEL[recipe.difficulty]} ・ {recipe.servings}人前
          </p>
        </div>
      </div>

      <p className="text-sm">{recipe.description}</p>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
              <th className="px-3 py-2 font-medium">材料</th>
              <th className="px-3 py-2 font-medium">必要量</th>
              <th className="px-3 py-2 font-medium">在庫量</th>
              <th className="px-3 py-2 font-medium">調理後</th>
            </tr>
          </thead>
          <tbody>
            {match.availability.map((a) => {
              const after = Math.max(0, a.availableAmount - a.requiredAmount);
              return (
                <tr key={a.ingredientId} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                  <td className="px-3 py-2">
                    {a.name}
                    {a.isOptional && <span className="ml-1 text-xs text-zinc-400">(任意)</span>}
                  </td>
                  <td className="px-3 py-2">{formatAmount(a.requiredAmount, a.requiredUnit)}</td>
                  <td className={`px-3 py-2 ${a.sufficient ? "" : "text-amber-600"}`}>
                    {formatAmount(a.availableAmount, a.requiredUnit)}
                  </td>
                  <td className="px-3 py-2">{formatAmount(after, a.requiredUnit)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {match.shortageIngredients.length > 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          不足材料: {match.shortageIngredients.map((s) => s.name).join("・")}
        </p>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">調理手順</h2>
        <ol className="flex flex-col gap-2 text-sm">
          {recipe.instructions.map((step, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">{idx + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <CookRecipe match={match} />
    </div>
  );
}
