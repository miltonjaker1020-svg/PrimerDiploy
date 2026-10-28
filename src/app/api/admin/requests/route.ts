import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSession, apiError } from "@/lib/api";

export async function GET() {
  try {
    await apiSession("ADMINISTRADOR");

    const requests = await prisma.request.findMany({
      include: {
        beneficiary: { select: { email: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) { return apiError(error); }
}
