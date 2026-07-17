import { NextRequest, NextResponse } from "next/server";
import { NotFoundError, setRuleActive } from "@/lib/store";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const rule = setRuleActive(id, true);
    return NextResponse.json({ rule });
  } catch (e) {
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    throw e;
  }
}
