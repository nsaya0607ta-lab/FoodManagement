import fs from "fs";
import path from "path";
import {
  ConsumptionRule,
  InventoryItem,
  InventoryTransaction,
  Recipe,
  StorageArea,
} from "./types";
import { buildSeedDatabase } from "./seed";

export interface Database {
  storageAreas: StorageArea[];
  inventoryItems: InventoryItem[];
  transactions: InventoryTransaction[];
  consumptionRules: ConsumptionRule[];
  recipes: Recipe[];
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function ensureDb(): void {
  if (!fs.existsSync(DB_PATH)) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const seed = buildSeedDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), "utf-8");
  }
}

export function readDb(): Database {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as Database;
}

export function writeDb(db: Database): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function resetDb(): Database {
  const seed = buildSeedDatabase();
  writeDb(seed);
  return seed;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
