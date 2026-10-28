import { NextResponse } from "next/server";
import { getInventorySummary } from "@/lib/inventory";
import { apiSession, apiError } from "@/lib/api";

export async function GET() {
  try {
    await apiSession("ADMINISTRADOR");

    const summary = await getInventorySummary();
    return NextResponse.json(summary);
  } catch (error) { return apiError(error); }
}
