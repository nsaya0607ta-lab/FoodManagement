import { NextRequest, NextResponse } from "next/server";
import { createInventoryItem, listInventory } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ items: listInventory() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const item = createInventoryItem({
      displayName: body.displayName,
      category: body.category,
      storageAreaId: body.storageAreaId,
      amount: Number(body.amount),
      amountUnit: body.amountUnit,
      purchaseDate: body.purchaseDate,
      expirationDate: body.expirationDate ?? null,
      expirationType: body.expirationType ?? undefined,
      isEstimatedExpiration: body.isEstimatedExpiration ?? false,
      managementType: body.managementType ?? undefined,
      registrationMethod: body.registrationMethod ?? "manual",
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
