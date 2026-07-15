/**
 * POST /api/notificaciones/documento — avisa por correo que se publicó un
 * documento en el micrositio. SOLO admin (PLAN §A2 / §2 seguridad).
 *
 * Flujo:
 *  1. Autoriza con `requireRol(["admin"])` ANTES de leer el cuerpo.
 *  2. Re-valida el cuerpo con Zod (doble validación; campo faltante ⇒ 400).
 *  3. Carga el documento y los destinatarios activos.
 *  4. Selecciona SOLO los destinatarios cuyo perfil corresponde al nivel de
 *     acceso del documento y les envía `NotificacionDocumento`.
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { ErrorAutorizacion, requireRol } from "@/lib/auth/roles";
import {
  obtenerDestinatariosActivos,
  obtenerDocumento,
} from "@/lib/notificaciones/consultas";
import { enviarNotificacionDocumento } from "@/lib/notificaciones/enviar";

/** Cuerpo esperado: el id del documento ya subido a notificar. */
const notificarDocumentoSchema = z.object({
  documentId: z
    .string({ required_error: "El documento es obligatorio." })
    .uuid("El identificador del documento no es válido."),
});

export async function POST(request: Request): Promise<Response> {
  // 1. Autorización: solo admin. Se responde antes de tocar el cuerpo.
  try {
    await requireRol(["admin"]);
  } catch (e) {
    if (e instanceof ErrorAutorizacion) {
      return NextResponse.json({ mensaje: e.message }, { status: e.status });
    }
    throw e;
  }

  // 2. Cuerpo + validación doble.
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(
      { mensaje: "El cuerpo de la petición no es JSON válido." },
      { status: 400 },
    );
  }

  const parsed = notificarDocumentoSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json(
      {
        mensaje: "Revisa los campos marcados.",
        errores: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // 3. Documento.
  const documento = await obtenerDocumento(parsed.data.documentId);
  if (!documento) {
    return NextResponse.json(
      { mensaje: "El documento no existe." },
      { status: 404 },
    );
  }

  // 4. Destinatarios y envío. La URL se arma con el origen de la petición
  //    (el micrositio está protegido en el proxy bajo /miembros).
  const destinatarios = await obtenerDestinatariosActivos();
  const origen = new URL(request.url).origin;
  const urlAcceso = `${origen}/miembros/documentos/${documento.id}`;

  const { enviados } = await enviarNotificacionDocumento(destinatarios, {
    documentoTitulo: documento.titulo,
    documentoTipo: documento.tipo,
    mes: documento.mes,
    anio: documento.anio,
    nivelAcceso: documento.nivelAcceso,
    urlAcceso,
  });

  return NextResponse.json(
    {
      mensaje: `Notificación enviada a ${enviados} destinatario(s).`,
      enviados,
    },
    { status: 200 },
  );
}
