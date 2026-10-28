import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiError, readBody } from "@/lib/api";
import { requiredText } from "@/lib/business-rules";
import { RequestError } from "@/lib/request-rules";

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const email = requiredText(body.email, "Correo", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError("Correo inválido", 400);
    const password = body.password;
    if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password) > 72) {
      throw new RequestError("La contraseña debe tener al menos 8 caracteres y máximo 72 bytes", 400);
    }
    const role = body.role;
    if (role !== "DONANTE" && role !== "BENEFICIARIO") throw new RequestError("Elige donante o beneficiario", 400);
    const user = await prisma.user.create({
      data: { email, password: await bcrypt.hash(password, 10), role },
      select: { id: true, email: true, role: true },
    });
    return Response.json({ message: "Usuario registrado correctamente", user }, { status: 201 });
  } catch (error) { return apiError(error); }
}
