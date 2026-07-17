import { NextResponse } from "next/server";
import { getStorageAreaCounts, listStorageAreas } from "@/lib/store";

export async function GET() {
  const areas = listStorageAreas();
  const counts = getStorageAreaCounts();
  return NextResponse.json({
    areas: areas.map((a) => ({ ...a, itemCount: counts[a.id] ?? 0 })),
  });
}
