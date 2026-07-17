import { NextRequest, NextResponse } from "next/server";
import { consumeInventoryItem, NotFoundError } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  try {
    const item = consumeInventoryItem(id, Number(body.amount), { note: body.note });
    return NextResponse.json({ item });
  } catch (e) {
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
