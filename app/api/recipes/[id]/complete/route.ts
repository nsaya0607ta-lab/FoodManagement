import { NextRequest, NextResponse } from "next/server";
import { completeRecipe, NotFoundError } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const multiplier = body?.servingsMultiplier ? Number(body.servingsMultiplier) : 1;
  try {
    const result = completeRecipe(id, multiplier);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
