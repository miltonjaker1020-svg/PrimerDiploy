import { prisma } from "@/lib/prisma";
import { apiSession, apiError } from "@/lib/api";
import { getSession } from "@/lib/auth-helpers";
import { createBeneficiaryRequest } from "@/lib/requests";
import { parseCreateRequestInput, RequestError } from "@/lib/request-rules";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: "Inicia sesión para continuar" }, { status: 401 });
    if (session.role !== "BENEFICIARIO") {
      return Response.json({ error: "Solo los beneficiarios pueden crear solicitudes" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "El cuerpo debe ser JSON válido" }, { status: 400 });
    }
    const input = parseCreateRequestInput(body);
    const created = await createBeneficiaryRequest(session.userId, input);
    return Response.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof RequestError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Create request error:", error);
    return Response.json({ error: "No se pudo crear la solicitud" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await apiSession("BENEFICIARIO");
    const requests = await prisma.request.findMany({
      where: { beneficiaryId: session.userId }, orderBy: { createdAt: "desc" },
      select: { id: true, quantity: true, status: true, rejectionReason: true, createdAt: true, product: { select: { name: true, unit: true } } },
    });
    return Response.json(requests, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
