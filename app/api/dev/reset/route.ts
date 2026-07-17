import { NextResponse } from "next/server";
import { resetDb } from "@/lib/db";

/** デモ用: 在庫データを初期状態にリセットする。 */
export async function POST() {
  resetDb();
  return NextResponse.json({ ok: true });
}
