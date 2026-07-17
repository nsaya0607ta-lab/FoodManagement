// ユーザーの在庫データは、サーバー（Vercelのサーバーレス関数など読み取り専用/一時的な
// ファイルシステム上）には一切書き込まない。ブラウザの localStorage にのみ保存する。
// この関数群は SSR（サーバーサイドレンダリング）中に呼ばれても安全なように、
// window / localStorage が存在しない環境では何もせず空データを返すガードを入れている。
//
// readDb() はプロセス内キャッシュを保持し、writeDb() のたびにキャッシュを破棄して
// 購読者（useLocalDb フック、lib/useLocalDb.ts）へ変更を通知する。
// これにより各画面は useSyncExternalStore 経由でデータの変化に自動追従できる。
import { ConsumptionRule, InventoryItem, InventoryTransaction } from "./types";
import { buildSeedLocalData } from "./seed";

export interface Database {
  inventoryItems: InventoryItem[];
  transactions: InventoryTransaction[];
  consumptionRules: ConsumptionRule[];
}

const STORAGE_KEY = "reizo:data:v1";

let cache: Database | null = null;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function emptyDatabase(): Database {
  return { inventoryItems: [], transactions: [], consumptionRules: [] };
}

function loadFromStorage(): Database {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = buildSeedLocalData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Database;
  } catch {
    const seed = buildSeedLocalData();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    } catch {
      // localStorage が使用不可（プライベートモード等）でも読み取りは継続できるようにする
    }
    return seed;
  }
}

export function readDb(): Database {
  if (!isBrowser()) {
    // SSR/ビルド時は localStorage を参照できないため、空データを返す。
    // 実データはクライアント側でマウント後に読み込む。
    return emptyDatabase();
  }
  if (!cache) cache = loadFromStorage();
  return cache;
}

export function writeDb(db: Database): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // 保存に失敗しても画面のクラッシュは避ける（容量超過・プライベートモード等）
  }
  // 次回 readDb() で localStorage から再読込させ、購読者へ新しいスナップショットを配布する。
  cache = null;
  listeners.forEach((listener) => listener());
}

export function resetDb(): Database {
  const seed = buildSeedLocalData();
  writeDb(seed);
  return seed;
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** useSyncExternalStore 用の購読関数。 */
export function subscribeDb(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
