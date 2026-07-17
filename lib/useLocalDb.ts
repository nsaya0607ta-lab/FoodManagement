"use client";

import { useSyncExternalStore } from "react";
import { readDb, subscribeDb, Database } from "./db";

function getSnapshot(): Database {
  return readDb();
}

// SSR中およびハイドレーション直後の最初の描画では null を返す（React公式の
// 「サーバーと最初のクライアント描画を一致させる」パターン）。localStorage への
// アクセスはここでは一切発生しない。マウント後、React が自動的に getSnapshot() を
// 使った再描画をスケジュールし、実データに切り替わる。
function getServerSnapshot(): Database | null {
  return null;
}

/**
 * localStorage 上の在庫データを購読する。戻り値が null の間はまだクライアントで
 * 読み込まれていないことを示す（画面側でローディング表示に使う）。
 * データが更新されると（lib/store.ts の各操作が内部で writeDb() を呼ぶたびに）
 * 自動的に再描画される。
 */
export function useLocalDb(): Database | null {
  return useSyncExternalStore<Database | null>(subscribeDb, getSnapshot, getServerSnapshot);
}
