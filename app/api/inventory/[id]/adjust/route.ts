import { NextRequest, NextResponse } from "next/server";
import { adjustInventoryItem, discardInventoryItem, NotFoundError } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  try {
    if (body.usedUp) {
      const item = discardInventoryItem(id, "使い切った");
      return NextResponse.json({ item });
    }
    const item = adjustInventoryItem(id, Number(body.amount), body.note);
    return NextResponse.json({ item });
  } catch (e) {
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
