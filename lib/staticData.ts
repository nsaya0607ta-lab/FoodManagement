// 保存場所とレシピはユーザーごとに変化しない固定データなので、
// localStorage にもファイルにも保存せず、コード上の定数として保持する。
// サーバー・クライアントのどちらからでも安全に参照できる（副作用なし）。
import { Recipe, RecipeIngredient, StorageArea } from "./types";

export const STORAGE_AREAS: StorageArea[] = [
  { id: "refrigerator", type: "refrigerator", name: "冷蔵室", sortOrder: 1 },
  { id: "chilled", type: "chilled", name: "チルド室", sortOrder: 2 },
  { id: "vegetable", type: "vegetable", name: "野菜室", sortOrder: 3 },
  { id: "freezer", type: "freezer", name: "冷凍室", sortOrder: 4 },
  { id: "ice", type: "ice", name: "製氷室", sortOrder: 5 },
  { id: "room_temperature", type: "room_temperature", name: "常温", sortOrder: 6 },
];

let ingredientCounter = 0;
function ingredient(
  recipeId: string,
  category: string,
  name: string,
  amount: number,
  amountUnit: string,
  isOptional = false,
): RecipeIngredient {
  ingredientCounter += 1;
  return {
    id: `ing_${ingredientCounter.toString().padStart(4, "0")}`,
    recipeId,
    category,
    name,
    amount,
    amountUnit,
    isOptional,
  };
}

const r1 = "recipe_cream_stew";
const r2 = "recipe_cheese_toast";
const r3 = "recipe_chicken_veggie_stirfry";
const r4 = "recipe_miso_soup";
const r5 = "recipe_udon_gratin";

export const RECIPES: Recipe[] = [
  {
    id: r1,
    name: "クリームシチュー",
    description: "牛乳と野菜、鶏肉でつくる定番のクリームシチュー。",
    servings: 2,
    cookingTimeMinutes: 30,
    difficulty: "normal",
    category: "主菜",
    imageEmoji: "🍲",
    instructions: [
      "鶏むね肉と野菜を一口大に切る。",
      "鍋で鶏肉と玉ねぎ、にんじんを炒める。",
      "水を加えて野菜が柔らかくなるまで煮る。",
      "牛乳とルウを加えてとろみがつくまで煮込む。",
    ],
    ingredients: [
      ingredient(r1, "meat", "鶏むね肉", 300, "g"),
      ingredient(r1, "vegetable", "玉ねぎ", 1, "個"),
      ingredient(r1, "vegetable", "にんじん", 1, "本"),
      ingredient(r1, "vegetable", "じゃがいも", 2, "個", true),
      ingredient(r1, "dairy", "牛乳", 200, "ml"),
    ],
  },
  {
    id: r2,
    name: "目玉焼きチーズトースト朝食セット",
    description: "食パン、卵、チーズで手早く作れる朝食。",
    servings: 1,
    cookingTimeMinutes: 10,
    difficulty: "easy",
    category: "主食",
    imageEmoji: "🍳",
    instructions: [
      "フライパンで卵を焼き、目玉焼きを作る。",
      "食パンにチーズをのせてトーストする。",
      "皿に盛り付けて完成。",
    ],
    ingredients: [
      ingredient(r2, "egg", "卵", 2, "個"),
      ingredient(r2, "bread", "食パン", 2, "枚"),
      ingredient(r2, "sliced", "スライスチーズ", 1, "枚"),
    ],
  },
  {
    id: r3,
    name: "鶏肉と野菜のうま塩炒め",
    description: "冷蔵庫の野菜を使い切れる炒め物。",
    servings: 2,
    cookingTimeMinutes: 15,
    difficulty: "easy",
    category: "副菜",
    imageEmoji: "🥘",
    instructions: [
      "鶏むね肉と野菜を食べやすい大きさに切る。",
      "フライパンで鶏肉を炒める。",
      "玉ねぎ、にんじん、キャベツを加えて炒める。",
      "塩こしょうで味を整える。",
    ],
    ingredients: [
      ingredient(r3, "meat", "鶏むね肉", 200, "g"),
      ingredient(r3, "vegetable", "玉ねぎ", 1, "個"),
      ingredient(r3, "vegetable", "にんじん", 1, "本", true),
      ingredient(r3, "vegetable", "キャベツ", 0.5, "玉"),
    ],
  },
  {
    id: r4,
    name: "豆腐と玉ねぎの味噌汁",
    description: "定番の味噌汁。あと1品ほしいときに。",
    servings: 2,
    cookingTimeMinutes: 10,
    difficulty: "easy",
    category: "スープ",
    imageEmoji: "🍜",
    instructions: ["だし汁を鍋で温める。", "豆腐と玉ねぎを加えて煮る。", "火を止めて味噌を溶き入れる。"],
    ingredients: [
      ingredient(r4, "other", "味噌", 30, "g"),
      ingredient(r4, "other", "豆腐", 1, "丁"),
      ingredient(r4, "vegetable", "玉ねぎ", 0.5, "個", true),
    ],
  },
  {
    id: r5,
    name: "うどんグラタン風チーズ焼き",
    description: "冷凍うどんとチーズ、牛乳で作る簡単グラタン。",
    servings: 1,
    cookingTimeMinutes: 20,
    difficulty: "normal",
    category: "主食",
    imageEmoji: "🧀",
    instructions: [
      "冷凍うどんを解凍し、耐熱皿に入れる。",
      "牛乳とチーズをかける。",
      "オーブントースターで焼き色がつくまで焼く。",
    ],
    ingredients: [
      ingredient(r5, "grain", "冷凍うどん", 1, "玉"),
      ingredient(r5, "dairy", "牛乳", 100, "ml"),
      ingredient(r5, "sliced", "スライスチーズ", 2, "枚"),
    ],
  },
];
