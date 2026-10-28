import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSession, apiError } from "@/lib/api";

export async function GET() {
  try {
    await apiSession("ADMINISTRADOR");

    const donations = await prisma.donation.findMany({
      include: {
        donor: { select: { email: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(donations);
  } catch (error) { return apiError(error); }
}
