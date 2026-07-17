import { Database } from "./db";
import { ConsumptionRule, InventoryItem, InventoryTransaction } from "./types";

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

/** 初回アクセス時に localStorage へ書き込むデモ用の初期在庫データ。 */
export function buildSeedLocalData(): Database {
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

  return {
    inventoryItems: items,
    transactions,
    consumptionRules: rules,
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
