import { NextRequest, NextResponse } from "next/server";
import { getStorageAreaInventory } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = getStorageAreaInventory(id);
  return NextResponse.json({ items });
}
