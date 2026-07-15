/**
 * /api/documentos — alta y listado de documentos.
 *
 * POST  crea un documento: sube el archivo a un bucket PRIVADO de Supabase
 *       Storage y guarda los metadatos en `documents` con su `nivel_acceso`.
 *       Solo `admin` (gestión documental del panel). Validación Zod DOBLE.
 * GET   lista los documentos VISIBLES para el rol de quien pide (RLS + filtro
 *       por nivel de acceso). Sin sesión con rol válido → 401/403.
 */
import { desc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { documents } from "@/db/schema";
import { ErrorAutorizacion, getUsuarioConRol, requireRol } from "@/lib/auth/roles";
import { nivelesVisiblesPara } from "@/lib/documentos/acceso";
import {
  BUCKET_DOCUMENTOS,
  construirStoragePath,
  esFormatoPermitido,
  formatoDesdeNombre,
  metadatosDocumentoSchema,
} from "@/lib/documentos/almacenamiento";
import { documentoSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

/** Traduce ErrorAutorizacion a una respuesta JSON con su status HTTP. */
function respuestaAutorizacion(error: unknown): NextResponse | null {
  if (error instanceof ErrorAutorizacion) {
    return NextResponse.json({ mensaje: error.message }, { status: error.status });
  }
  return null;
}

/**
 * POST /api/documentos
 * Cuerpo: multipart/form-data con `archivo` (File) + campos de metadatos
 *   (titulo, mes, anio, nivelAcceso, tipo).
 * Respuestas:
 *   201 { id, storagePath }       — creado
 *   400 { mensaje, errores }      — payload/campo inválido (error por campo)
 *   401/403 { mensaje }           — sin sesión / sin rol admin
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const { user } = await requireRol(["admin"]);

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json(
        { mensaje: "El cuerpo debe ser multipart/form-data." },
        { status: 400 },
      );
    }

    // 1.ª validación de servidor: metadatos (subconjunto del documentoSchema).
    const mesCrudo = form.get("mes");
    const anioCrudo = form.get("anio");
    const metaParse = metadatosDocumentoSchema.safeParse({
      titulo: form.get("titulo") ?? undefined,
      mes: mesCrudo == null || mesCrudo === "" ? undefined : Number(mesCrudo),
      anio: anioCrudo == null || anioCrudo === "" ? undefined : Number(anioCrudo),
      nivelAcceso: form.get("nivelAcceso") ?? undefined,
      tipo: form.get("tipo") ?? undefined,
    });
    if (!metaParse.success) {
      return NextResponse.json(
        {
          mensaje: "Revisa los campos marcados.",
          errores: metaParse.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Archivo obligatorio y con formato permitido.
    const archivo = form.get("archivo");
    if (!(archivo instanceof File) || archivo.size === 0) {
      return NextResponse.json(
        {
          mensaje: "Revisa los campos marcados.",
          errores: { archivo: ["El archivo es obligatorio."] },
        },
        { status: 400 },
      );
    }
    const formato = formatoDesdeNombre(archivo.name);
    if (!formato || !esFormatoPermitido(formato)) {
      return NextResponse.json(
        {
          mensaje: "Revisa los campos marcados.",
          errores: {
            archivo: ["Formato no permitido (PDF, Word o Excel)."],
          },
        },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const storagePath = construirStoragePath({
      anio: metaParse.data.anio,
      mes: metaParse.data.mes,
      formato,
      id,
    });

    // 2.ª validación de servidor: objeto COMPLETO contra documentoSchema.
    const completoParse = documentoSchema.safeParse({
      ...metaParse.data,
      storagePath,
      formato,
    });
    if (!completoParse.success) {
      return NextResponse.json(
        {
          mensaje: "Revisa los campos marcados.",
          errores: completoParse.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Subida al bucket PRIVADO (service role; nunca URL pública).
    const supabase = createAdminClient();
    const bytes = new Uint8Array(await archivo.arrayBuffer());
    const { error: errorSubida } = await supabase.storage
      .from(BUCKET_DOCUMENTOS)
      .upload(storagePath, bytes, {
        contentType: archivo.type || "application/octet-stream",
        upsert: false,
      });
    if (errorSubida) {
      return NextResponse.json(
        { mensaje: "No se pudo almacenar el archivo. Intenta de nuevo." },
        { status: 502 },
      );
    }

    // Metadatos a la BD. Si esto falla, borra el objeto huérfano del bucket.
    try {
      await db.insert(documents).values({
        id,
        titulo: completoParse.data.titulo,
        mes: completoParse.data.mes,
        anio: completoParse.data.anio,
        nivelAcceso: completoParse.data.nivelAcceso,
        tipo: completoParse.data.tipo,
        storagePath: completoParse.data.storagePath,
        formato: completoParse.data.formato,
        creadoPor: user.id,
      });
    } catch (errorDb) {
      await supabase.storage.from(BUCKET_DOCUMENTOS).remove([storagePath]);
      throw errorDb;
    }

    return NextResponse.json({ id, storagePath }, { status: 201 });
  } catch (error) {
    const respuesta = respuestaAutorizacion(error);
    if (respuesta) return respuesta;
    throw error;
  }
}

/**
 * GET /api/documentos
 * Lista los documentos visibles para el rol del solicitante (filtro por
 * nivel de acceso). `admin` y `consejo` ven todos los niveles; `asociados`
 * solo publico + asociados.
 * Respuestas:
 *   200 { documentos: [...] }
 *   401 { mensaje }   — sin sesión con rol válido
 */
export async function GET(): Promise<Response> {
  const usuario = await getUsuarioConRol();
  if (!usuario) {
    return NextResponse.json(
      { mensaje: "Debes iniciar sesión para ver los documentos." },
      { status: 401 },
    );
  }

  const niveles = nivelesVisiblesPara(usuario.rol);

  const filas = await db
    .select({
      id: documents.id,
      titulo: documents.titulo,
      mes: documents.mes,
      anio: documents.anio,
      nivelAcceso: documents.nivelAcceso,
      tipo: documents.tipo,
      formato: documents.formato,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(inArray(documents.nivelAcceso, niveles))
    .orderBy(desc(documents.anio), desc(documents.mes), desc(documents.createdAt));

  return NextResponse.json({ documentos: filas }, { status: 200 });
}
