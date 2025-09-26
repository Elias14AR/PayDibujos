import { NextResponse } from "next/server";
import { connectDB } from "@/services/mongodb";
import User from "@/models/User";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  exp: number;
}

// GET /api/admin/users?email=correo@example.com
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: TokenPayload;
    try {
      decoded = jwtDecode<TokenPayload>(token);
    } catch (err) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    if (decoded.exp < currentTime) {
      return NextResponse.json({ error: "Token expirado" }, { status: 401 });
    }

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    if (!email) {
      return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    }

    const sanitizedEmail = email.trim().toLowerCase(); // Sanea el email
    const users = await User.find({ email: { $regex: sanitizedEmail, $options: "i" } });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error en /api/admin/users:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
