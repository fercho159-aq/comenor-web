/**
 * GET /api/documentos/[id]/url-firmada
 *
 * Devuelve una URL FIRMADA de MinIO/S3 de vida corta (60 s) para que
 * el visor renderice el documento, SIEMPRE que el rol del solicitante tenga
 * acceso al nivel del documento. Barrera contra IDOR: un asociado que pide un
 * documento de nivel `consejo` recibe 403 y NUNCA se firma la URL.
 *
 * Nunca se expone una URL pública (PLAN.md §2 punto 7).
 */
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { documents } from "@/db/schema";
import { getUsuarioConRol } from "@/lib/auth/roles";
import { esNivelAcceso, puedeAccederNivel } from "@/lib/documentos/acceso";
import { BUCKET_DOCUMENTOS } from "@/lib/documentos/almacenamiento";
import { urlFirmada, VIDA_URL_FIRMADA_SEGUNDOS } from "@/lib/storage/firmadas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const usuario = await getUsuarioConRol();
  if (!usuario) {
    return NextResponse.json(
      { mensaje: "Debes iniciar sesión para ver el documento." },
      { status: 401 },
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { mensaje: "Falta el identificador del documento." },
      { status: 400 },
    );
  }

  const filas = await db
    .select({
      nivelAcceso: documents.nivelAcceso,
      storagePath: documents.storagePath,
    })
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  const documento = filas[0];

  // No revelar existencia a quien no debería verlo: 404 genérico si no está.
  if (!documento || !esNivelAcceso(documento.nivelAcceso)) {
    return NextResponse.json(
      { mensaje: "Documento no encontrado." },
      { status: 404 },
    );
  }

  // Autorización por nivel ANTES de firmar (defensa contra IDOR).
  if (!puedeAccederNivel(usuario.rol, documento.nivelAcceso)) {
    return NextResponse.json(
      { mensaje: "No tienes acceso a este documento." },
      { status: 403 },
    );
  }

  const url = await urlFirmada(
    BUCKET_DOCUMENTOS,
    documento.storagePath,
    VIDA_URL_FIRMADA_SEGUNDOS,
  );

  return NextResponse.json(
    { url, expiraEnSegundos: VIDA_URL_FIRMADA_SEGUNDOS },
    { status: 200 },
  );
}
