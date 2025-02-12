import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔍 Consultando roles en la base de datos...");
    
    const roles = await prisma.role.findMany();
    console.log("✅ Roles obtenidos:", roles);

    if (!roles || roles.length === 0) {
      return NextResponse.json({ message: "No hay roles disponibles" }, { status: 404 });
    }

    return NextResponse.json(roles);
  } catch (error: unknown) {
    // Convertir error a string manejable
    const errMessage = error instanceof Error ? error.message : String(error);

    console.error("❌ Error al obtener roles:", errMessage);

    return NextResponse.json(
      { error: "Error en el servidor", details: errMessage },
      { status: 500 }
    );
  }
}

