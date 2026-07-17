import { NextResponse } from "next/server";
import { runDueConsumptionRules } from "@/lib/store";

/**
 * 期限を過ぎた自動消費ルールを実行する。
 * 本来はバックエンドの定期ジョブ（cron）から呼び出す想定だが、
 * MVPではホーム画面表示時にこのエンドポイントを呼び出してシミュレートする。
 */
export async function POST() {
  const result = runDueConsumptionRules();
  return NextResponse.json(result);
}
