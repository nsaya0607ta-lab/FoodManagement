import { Database } from "./db";
import {
  ConsumptionRule,
  InventoryItem,
  InventoryTransaction,
  Recipe,
  RecipeIngredient,
  StorageArea,
} from "./types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

let idCounter = 0;
function id(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter.toString().padStart(4, "0")}`;
}

export const STORAGE_AREAS: StorageArea[] = [
  { id: "refrigerator", type: "refrigerator", name: "冷蔵室", sortOrder: 1 },
  { id: "chilled", type: "chilled", name: "チルド室", sortOrder: 2 },
  { id: "vegetable", type: "vegetable", name: "野菜室", sortOrder: 3 },
  { id: "freezer", type: "freezer", name: "冷凍室", sortOrder: 4 },
  { id: "ice", type: "ice", name: "製氷室", sortOrder: 5 },
  { id: "room_temperature", type: "room_temperature", name: "常温", sortOrder: 6 },
];

function nextWeekdayTime(time: string, allowedDays: number[] | null): string {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  const candidate = new Date(now);
  candidate.setHours(h, m, 0, 0);
  for (let i = 0; i < 8; i++) {
    const day = candidate.getDay();
    const isAllowed = !allowedDays || allowedDays.includes(day);
    if (isAllowed && candidate.getTime() > now.getTime()) {
      return candidate.toISOString();
    }
    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(h, m, 0, 0);
  }
  return candidate.toISOString();
}

export function buildSeedDatabase(): Database {
  idCounter = 0;
  const now = new Date().toISOString();

  const items: InventoryItem[] = [
    mkItem({
      name: "牛乳(料理用)",
      category: "dairy",
      storage: "refrigerator",
      initial: 1000,
      current: 650,
      unit: "ml",
      purchase: daysAgo(3),
      expiration: daysFromNow(4),
      expirationType: "best_before",
    }),
    mkItem({
      name: "牛乳(飲用)",
      category: "dairy",
      storage: "refrigerator",
      initial: 1000,
      current: 800,
      unit: "ml",
      purchase: daysAgo(0),
      expiration: daysFromNow(6),
      expirationType: "best_before",
      managementType: "free_consumption",
    }),
    mkItem({
      name: "卵",
      category: "egg",
      storage: "refrigerator",
      initial: 10,
      current: 6,
      unit: "個",
      purchase: daysAgo(5),
      expiration: daysFromNow(10),
      expirationType: "use_by",
    }),
    mkItem({
      name: "味噌",
      category: "other",
      storage: "refrigerator",
      initial: 500,
      current: 450,
      unit: "g",
      purchase: daysAgo(20),
      expiration: daysFromNow(60),
      expirationType: "ai_estimated",
      isEstimated: true,
    }),
    mkItem({
      name: "豆腐",
      category: "other",
      storage: "refrigerator",
      initial: 1,
      current: 1,
      unit: "丁",
      purchase: daysAgo(0),
      expiration: daysFromNow(3),
      expirationType: "use_by",
    }),
    mkItem({
      name: "ヨーグルト",
      category: "dairy",
      storage: "refrigerator",
      initial: 4,
      current: 2,
      unit: "個",
      purchase: daysAgo(2),
      expiration: daysFromNow(5),
      expirationType: "best_before",
    }),
    mkItem({
      name: "食パン",
      category: "bread",
      storage: "refrigerator",
      initial: 6,
      current: 4,
      unit: "枚",
      purchase: daysAgo(2),
      expiration: daysFromNow(4),
      expirationType: "best_before",
      managementType: "free_consumption",
    }),
    mkItem({
      name: "スライスチーズ",
      category: "sliced",
      storage: "chilled",
      initial: 8,
      current: 5,
      unit: "枚",
      purchase: daysAgo(4),
      expiration: daysFromNow(14),
      expirationType: "best_before",
    }),
    mkItem({
      name: "ハム",
      category: "sliced",
      storage: "chilled",
      initial: 6,
      current: 3,
      unit: "枚",
      purchase: daysAgo(2),
      expiration: daysFromNow(5),
      expirationType: "use_by",
    }),
    mkItem({
      name: "納豆",
      category: "other",
      storage: "chilled",
      initial: 3,
      current: 2,
      unit: "パック",
      purchase: daysAgo(1),
      expiration: daysFromNow(6),
      expirationType: "best_before",
    }),
    mkItem({
      name: "玉ねぎ",
      category: "vegetable",
      storage: "vegetable",
      initial: 3,
      current: 2,
      unit: "個",
      purchase: daysAgo(7),
      expiration: daysFromNow(14),
      expirationType: "ai_estimated",
      isEstimated: true,
    }),
    mkItem({
      name: "にんじん",
      category: "vegetable",
      storage: "vegetable",
      initial: 3,
      current: 3,
      unit: "本",
      purchase: daysAgo(7),
      expiration: daysFromNow(14),
      expirationType: "ai_estimated",
      isEstimated: true,
    }),
    mkItem({
      name: "キャベツ",
      category: "vegetable",
      storage: "vegetable",
      initial: 1,
      current: 0.5,
      unit: "玉",
      purchase: daysAgo(5),
      expiration: daysFromNow(10),
      expirationType: "ai_estimated",
      isEstimated: true,
    }),
    mkItem({
      name: "じゃがいも",
      category: "vegetable",
      storage: "vegetable",
      initial: 5,
      current: 4,
      unit: "個",
      purchase: daysAgo(10),
      expiration: daysFromNow(21),
      expirationType: "ai_estimated",
      isEstimated: true,
    }),
    mkItem({
      name: "鶏むね肉",
      category: "meat",
      storage: "freezer",
      initial: 400,
      current: 400,
      unit: "g",
      purchase: daysAgo(2),
      expiration: daysFromNow(30),
      expirationType: "best_before",
    }),
    mkItem({
      name: "冷凍うどん",
      category: "grain",
      storage: "freezer",
      initial: 3,
      current: 2,
      unit: "玉",
      purchase: daysAgo(10),
      expiration: daysFromNow(60),
      expirationType: "best_before",
    }),
    mkItem({
      name: "氷",
      category: "other",
      storage: "ice",
      initial: 20,
      current: 20,
      unit: "個",
      purchase: daysAgo(0),
      expiration: null,
      expirationType: null,
      managementType: "unmanaged",
    }),
  ];

  const transactions: InventoryTransaction[] = items.map((item) => ({
    id: id("txn"),
    inventoryItemId: item.id,
    transactionType: "purchase",
    amountBefore: 0,
    changeAmount: item.initialAmount,
    amountAfter: item.initialAmount,
    sourceType: "manual",
    sourceId: null,
    note: "初期登録",
    executedAt: item.purchaseDate + "T09:00:00.000Z",
  }));

  items.forEach((item) => {
    if (item.currentAmount < item.initialAmount) {
      const used = item.initialAmount - item.currentAmount;
      transactions.push({
        id: id("txn"),
        inventoryItemId: item.id,
        transactionType: "consume",
        amountBefore: item.initialAmount,
        changeAmount: -used,
        amountAfter: item.currentAmount,
        sourceType: "manual",
        sourceId: null,
        note: "利用",
        executedAt: now,
      });
    }
  });

  const milk = items.find((i) => i.displayName === "牛乳(飲用)")!;
  const bread = items.find((i) => i.displayName === "食パン")!;
  const egg = items.find((i) => i.displayName === "卵")!;

  const rules: ConsumptionRule[] = [
    {
      id: id("rule"),
      inventoryItemId: milk.id,
      name: "朝の牛乳",
      consumeAmount: 100,
      amountUnit: "ml",
      recurrenceType: "daily",
      recurrenceValue: null,
      executionTime: "08:00",
      startDate: daysAgo(0),
      endDate: null,
      nextExecutionAt: nextWeekdayTime("08:00", null),
      shortageAction: "zero_and_notify",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: id("rule"),
      inventoryItemId: bread.id,
      name: "平日の朝食パン",
      consumeAmount: 1,
      amountUnit: "枚",
      recurrenceType: "weekdays",
      recurrenceValue: [1, 2, 3, 4, 5],
      executionTime: "07:30",
      startDate: daysAgo(0),
      endDate: null,
      nextExecutionAt: nextWeekdayTime("07:30", [1, 2, 3, 4, 5]),
      shortageAction: "zero_and_notify",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: id("rule"),
      inventoryItemId: egg.id,
      name: "月水金の卵",
      consumeAmount: 1,
      amountUnit: "個",
      recurrenceType: "weekly_days",
      recurrenceValue: [1, 3, 5],
      executionTime: "19:00",
      startDate: daysAgo(0),
      endDate: null,
      nextExecutionAt: nextWeekdayTime("19:00", [1, 3, 5]),
      shortageAction: "zero_and_notify",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const recipes = buildRecipes();

  return {
    storageAreas: STORAGE_AREAS,
    inventoryItems: items,
    transactions,
    consumptionRules: rules,
    recipes,
  };
}

function mkItem(opts: {
  name: string;
  category: string;
  storage: string;
  initial: number;
  current: number;
  unit: string;
  purchase: string;
  expiration: string | null;
  expirationType: InventoryItem["expirationType"];
  isEstimated?: boolean;
  managementType?: InventoryItem["managementType"];
}): InventoryItem {
  const now = new Date().toISOString();
  return {
    id: id("inv"),
    displayName: opts.name,
    category: opts.category,
    storageAreaId: opts.storage,
    managementType: opts.managementType ?? "normal",
    initialAmount: opts.initial,
    currentAmount: opts.current,
    amountUnit: opts.unit,
    purchaseDate: opts.purchase,
    openedDate: null,
    expirationDate: opts.expiration,
    expirationType: opts.expirationType,
    isEstimatedExpiration: opts.isEstimated ?? false,
    registrationMethod: "manual",
    status: "active",
    imageUrl: null,
    createdAt: now,
    updatedAt: now,
  };
}

function ingredient(
  recipeId: string,
  category: string,
  name: string,
  amount: number,
  amountUnit: string,
  isOptional = false,
): RecipeIngredient {
  return { id: id("ing"), recipeId, category, name, amount, amountUnit, isOptional };
}

function buildRecipes(): Recipe[] {
  const r1 = id("recipe");
  const r2 = id("recipe");
  const r3 = id("recipe");
  const r4 = id("recipe");
  const r5 = id("recipe");

  const recipes: Recipe[] = [
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
      instructions: [
        "だし汁を鍋で温める。",
        "豆腐と玉ねぎを加えて煮る。",
        "火を止めて味噌を溶き入れる。",
      ],
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

  return recipes;
}
