import { NextRequest, NextResponse } from "next/server";
import { createConsumptionRule, listConsumptionRules } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ rules: listConsumptionRules() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const rule = createConsumptionRule({
      inventoryItemId: body.inventoryItemId,
      name: body.name,
      consumeAmount: Number(body.consumeAmount),
      amountUnit: body.amountUnit,
      recurrenceType: body.recurrenceType,
      recurrenceValue: body.recurrenceValue ?? null,
      executionTime: body.executionTime,
      startDate: body.startDate,
      endDate: body.endDate ?? null,
      shortageAction: body.shortageAction ?? undefined,
    });
    return NextResponse.json({ rule }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
