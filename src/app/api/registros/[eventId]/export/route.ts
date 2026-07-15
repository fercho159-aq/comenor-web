/**
 * GET /api/registros/[eventId]/export — descarga .xlsx de los registros de un
 * evento (PLAN.md §A2). Solo rol `admin` (requireRol).
 *
 * Respuestas:
 *   200  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 *        Content-Disposition: attachment; filename="registros-<slug>.xlsx"
 *   400  { mensaje, errores }  → eventId no es un UUID válido.
 *   401  { mensaje }           → sin sesión.
 *   403  { mensaje }           → sesión sin rol admin.
 *   404  { mensaje }           → el evento no existe.
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { events, registrations } from "@/db/schema";
import { ErrorAutorizacion, requireRol } from "@/lib/auth/roles";
import {
  construirLibroRegistros,
  nombreArchivoRegistros,
  type FilaRegistroExport,
} from "./logic";

const CONTENT_TYPE_XLSX =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const paramsSchema = z.object({
  eventId: z.string().uuid("El identificador del evento no es válido."),
});

export async function GET(
  _request: Request,
  contexto: { params: Promise<{ eventId: string }> },
): Promise<Response> {
  try {
    await requireRol(["admin"]);
  } catch (e) {
    if (e instanceof ErrorAutorizacion) {
      return NextResponse.json({ mensaje: e.message }, { status: e.status });
    }
    throw e;
  }

  const parametros = paramsSchema.safeParse(await contexto.params);
  if (!parametros.success) {
    return NextResponse.json(
      {
        mensaje: "Revisa los campos marcados.",
        errores: parametros.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  const { eventId } = parametros.data;

  const evento = await db
    .select({ nombre: events.nombre })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!evento[0]) {
    return NextResponse.json(
      { mensaje: "El evento no existe." },
      { status: 404 },
    );
  }

  const filas: FilaRegistroExport[] = await db
    .select({
      nombre: registrations.nombre,
      cargo: registrations.cargo,
      correo: registrations.correo,
      celular: registrations.celular,
      organismo: registrations.organismo,
      estadoPago: registrations.estadoPago,
      checkedInAt: registrations.checkedInAt,
    })
    .from(registrations)
    .where(eq(registrations.eventId, eventId));

  const buffer = await construirLibroRegistros(evento[0].nombre, filas);
  const archivo = nombreArchivoRegistros(evento[0].nombre);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": CONTENT_TYPE_XLSX,
      "Content-Disposition": `attachment; filename="${archivo}"`,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "no-store",
    },
  });
}
