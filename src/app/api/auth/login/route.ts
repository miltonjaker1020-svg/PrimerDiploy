import { tokenCookieOptions } from "@/lib/session";
import { apiError, readBody } from "@/lib/api";
import { requiredText } from "@/lib/business-rules";
import { RequestError } from "@/lib/request-rules";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const email = requiredText(body.email, "Correo", 254).toLowerCase();
    const password = body.password;
    if (typeof password !== "string" || !password) throw new RequestError("La contraseña es obligatoria", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await signRefreshToken({ userId: user.id });
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    const cookieStore = await cookies();

    cookieStore.set("access_token", accessToken, tokenCookieOptions(accessToken));
    cookieStore.set("refresh_token", refreshToken, tokenCookieOptions(refreshToken));

    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
