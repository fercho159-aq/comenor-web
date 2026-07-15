/**
 * /api/documentos/[id]/versiones — versiones richtext (Tiptap) de un documento.
 *
 * POST guarda una nueva versión con número INCREMENTAL y el editor que la creó.
 *      Solo `consejo` y `admin` (edición de documentos del Consejo, PLAN A2).
 *      Validación Zod DOBLE (cliente + este handler).
 * GET  lista las versiones del documento (metadatos + contenido), más recientes
 *      primero, para quien tenga acceso al nivel del documento.
 */
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { documents, documentVersions } from "@/db/schema";
import {
  ErrorAutorizacion,
  getUsuarioConRol,
  requireRol,
} from "@/lib/auth/roles";
import { esNivelAcceso, puedeAccederNivel } from "@/lib/documentos/acceso";
import { versionDocumentoSchema } from "@/lib/documentos/schema-version";

/** Lee el nivel de acceso del documento, o null si no existe / es inválido. */
async function nivelDelDocumento(
  id: string,
): Promise<"publico" | "asociados" | "consejo" | null> {
  const filas = await db
    .select({ nivelAcceso: documents.nivelAcceso })
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  const nivel = filas[0]?.nivelAcceso;
  return esNivelAcceso(nivel) ? nivel : null;
}

/**
 * POST /api/documentos/[id]/versiones
 * Cuerpo JSON: { contenidoRichtext: string }
 * Respuestas:
 *   201 { id, version }      — versión creada
 *   400 { mensaje, errores } — contenido inválido (error por campo)
 *   401/403 { mensaje }      — sin sesión / sin rol consejo|admin
 *   404 { mensaje }          — documento inexistente
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { user } = await requireRol(["consejo", "admin"]);
    const { id } = await params;

    let cuerpo: unknown;
    try {
      cuerpo = await request.json();
    } catch {
      return NextResponse.json(
        { mensaje: "El cuerpo de la petición no es JSON válido." },
        { status: 400 },
      );
    }

    const parse = versionDocumentoSchema.safeParse(cuerpo);
    if (!parse.success) {
      return NextResponse.json(
        {
          mensaje: "Revisa los campos marcados.",
          errores: parse.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const nivel = await nivelDelDocumento(id);
    if (!nivel) {
      return NextResponse.json(
        { mensaje: "Documento no encontrado." },
        { status: 404 },
      );
    }

    // Número de versión incremental (máximo actual + 1).
    const ultima = await db
      .select({ version: documentVersions.version })
      .from(documentVersions)
      .where(eq(documentVersions.documentId, id))
      .orderBy(desc(documentVersions.version))
      .limit(1);
    const siguiente = (ultima[0]?.version ?? 0) + 1;

    const insertadas = await db
      .insert(documentVersions)
      .values({
        documentId: id,
        contenidoRichtext: parse.data.contenidoRichtext,
        version: siguiente,
        editadoPor: user.id,
      })
      .returning({ id: documentVersions.id, version: documentVersions.version });

    return NextResponse.json(insertadas[0], { status: 201 });
  } catch (error) {
    if (error instanceof ErrorAutorizacion) {
      return NextResponse.json(
        { mensaje: error.message },
        { status: error.status },
      );
    }
    throw error;
  }
}

/**
 * GET /api/documentos/[id]/versiones
 * Respuestas:
 *   200 { versiones: [...] }  — más recientes primero
 *   401 { mensaje }           — sin sesión con rol válido
 *   403 { mensaje }           — sin acceso al nivel del documento
 *   404 { mensaje }           — documento inexistente
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const usuario = await getUsuarioConRol();
  if (!usuario) {
    return NextResponse.json(
      { mensaje: "Debes iniciar sesión." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const nivel = await nivelDelDocumento(id);
  if (!nivel) {
    return NextResponse.json(
      { mensaje: "Documento no encontrado." },
      { status: 404 },
    );
  }

  if (!puedeAccederNivel(usuario.rol, nivel)) {
    return NextResponse.json(
      { mensaje: "No tienes acceso a este documento." },
      { status: 403 },
    );
  }

  const versiones = await db
    .select({
      id: documentVersions.id,
      version: documentVersions.version,
      contenidoRichtext: documentVersions.contenidoRichtext,
      editadoPor: documentVersions.editadoPor,
      createdAt: documentVersions.createdAt,
    })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, id))
    .orderBy(desc(documentVersions.version));

  return NextResponse.json({ versiones }, { status: 200 });
}
