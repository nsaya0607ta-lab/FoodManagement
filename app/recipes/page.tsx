"use client";

import Link from "next/link";
import { recommendRecipes } from "@/lib/store";
import type { RecipeMatch } from "@/lib/store";
import { useLocalDb } from "@/lib/useLocalDb";

const DIFFICULTY_LABEL: Record<string, string> = { easy: "かんたん", normal: "ふつう", hard: "むずかしい" };

export default function RecipesPage() {
  const db = useLocalDb();
  const matches = db ? recommendRecipes() : [];

  const readyToCook = matches.filter((m) => m.canCookWithoutShopping);
  const almostReady = matches.filter((m) => !m.canCookWithoutShopping && m.shortageIngredients.length === 1);
  const usesExpiring = matches.filter((m) => m.usesExpiringItems);

  return (
    <div className="flex flex-col gap-5 px-4 pt-5">
      <h1 className="text-lg font-bold">レシピ提案</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        今の在庫から作れる料理をスコア順に表示しています。
      </p>

      {!db ? (
        <p className="py-8 text-center text-sm text-zinc-500">読み込み中...</p>
      ) : (
        <>
          {readyToCook.length > 0 && (
            <RecipeSection title="買い足しなしで作れる" matches={readyToCook} />
          )}
          {almostReady.length > 0 && <RecipeSection title="あと1品で作れる" matches={almostReady} />}
          {usesExpiring.length > 0 && (
            <RecipeSection title="期限が近い食材を使える" matches={usesExpiring} />
          )}

          <section>
            <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">すべてのレシピ</h2>
            <RecipeList matches={matches} />
          </section>
        </>
      )}
    </div>
  );
}

function RecipeSection({ title, matches }: { title: string; matches: RecipeMatch[] }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">{title}</h2>
      <RecipeList matches={matches} />
    </section>
  );
}

function RecipeList({ matches }: { matches: RecipeMatch[] }) {
  return (
    <div className="flex flex-col gap-2">
      {matches.map((m) => (
        <Link
          key={m.recipe.id}
          href={`/recipes/${m.recipe.id}`}
          className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <span className="text-3xl" aria-hidden>
            {m.recipe.imageEmoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{m.recipe.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {m.recipe.category} ・ {m.recipe.cookingTimeMinutes}分 ・ {m.recipe.servings}人前 ・{" "}
              {DIFFICULTY_LABEL[m.recipe.difficulty]}
            </p>
            {m.shortageIngredients.length > 0 && (
              <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                不足: {m.shortageIngredients.map((s) => s.name).join("・")}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              一致率 {m.matchRate}%
            </p>
            {m.canCookWithoutShopping && (
              <p className="text-xs text-zinc-500">買い足し不要</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
