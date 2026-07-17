import { NextResponse } from "next/server";
import { recommendRecipes } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ recommendations: recommendRecipes() });
}
