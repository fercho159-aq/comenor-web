/**
 * POST /api/checkin — check-in de asistente por QR escaneado (PLAN.md §A3).
 *
 * Solo rol `admin` (requireRol). Recibe el token del QR, verifica la firma,
 * busca el registro por hash y aplica la regla de uso único de forma atómica.
 *
 * Respuestas:
 *   200 { ok: true, asistente }           → acceso concedido, marcado ahora.
 *   400 { mensaje, errores }               → body inválido (token vacío/ausente).
 *   401 { mensaje }                        → sin sesión.
 *   403 { mensaje }                        → sesión sin rol admin.
 *   409 { mensaje, motivo }                → token inválido/alterado, no
 *                                            encontrado o ya usado.
 */
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { registrations } from "@/db/schema";
import { ErrorAutorizacion, requireRol } from "@/lib/auth/roles";
import {
  procesarCheckin,
  type RegistroCheckin,
  type RepositorioCheckin,
} from "./logic";

/** Cuerpo esperado: el token crudo que codifica el QR. */
const checkinSchema = z.object({
  token: z
    .string({ message: "El token del QR es obligatorio." })
    .trim()
    .min(1, "El token del QR es obligatorio."),
});

const COLUMNAS = {
  id: registrations.id,
  eventId: registrations.eventId,
  nombre: registrations.nombre,
  cargo: registrations.cargo,
  correo: registrations.correo,
  organismo: registrations.organismo,
  checkedInAt: registrations.checkedInAt,
} as const;

/** Repositorio de check-in respaldado por Drizzle/Postgres. */
const repositorioDb: RepositorioCheckin = {
  async buscarPorHash(hash: string): Promise<RegistroCheckin | null> {
    const filas = await db
      .select(COLUMNAS)
      .from(registrations)
      .where(eq(registrations.qrTokenHash, hash))
      .limit(1);
    return filas[0] ?? null;
  },
  async marcarCheckin(id: string): Promise<RegistroCheckin | null> {
    // UPDATE condicional: solo marca si aún no tiene check-in (atómico).
    const filas = await db
      .update(registrations)
      .set({ checkedInAt: new Date() })
      .where(and(eq(registrations.id, id), isNull(registrations.checkedInAt)))
      .returning(COLUMNAS);
    return filas[0] ?? null;
  },
};

export async function POST(request: Request): Promise<Response> {
  try {
    await requireRol(["admin"]);
  } catch (e) {
    if (e instanceof ErrorAutorizacion) {
      return NextResponse.json({ mensaje: e.message }, { status: e.status });
    }
    throw e;
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(
      { mensaje: "El cuerpo de la petición no es JSON válido." },
      { status: 400 },
    );
  }

  const resultado = checkinSchema.safeParse(cuerpo);
  if (!resultado.success) {
    return NextResponse.json(
      {
        mensaje: "Revisa los campos marcados.",
        errores: resultado.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const checkin = await procesarCheckin(resultado.data.token, repositorioDb);
  if (!checkin.ok) {
    return NextResponse.json(
      { mensaje: checkin.mensaje, motivo: checkin.motivo },
      { status: 409 },
    );
  }

  return NextResponse.json(
    { ok: true, asistente: checkin.asistente },
    { status: 200 },
  );
}
