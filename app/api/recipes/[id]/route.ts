import { NextRequest, NextResponse } from "next/server";
import { getRecipeMatch, NotFoundError } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const match = getRecipeMatch(id);
    return NextResponse.json(match);
  } catch (e) {
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    throw e;
  }
}
