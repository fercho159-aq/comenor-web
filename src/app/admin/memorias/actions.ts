"use server";

/**
 * Server Actions del módulo Memorias.
 *
 * No existe un route handler en `src/app/api/*` para galerías/fotos, así que la
 * mutación vive aquí, colocada con su UI (patrón idiomático de Next 16 para el
 * panel admin) y detrás de `requireRol(["admin"])`. Reutiliza los wrappers
 * compartidos: `@/db` (drizzle), `@/lib/supabase/admin` (Storage service-role) y
 * `@/lib/auth/roles`. La compresión de imágenes usa `sharp` al subir.
 *
 * SOLO SERVIDOR. La service-role key nunca llega al cliente.
 */
import { randomUUID } from "node:crypto";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

import { db } from "@/db";
import { auditLog, galleries, galleryPhotos } from "@/db/schema";
import { ErrorAutorizacion, requireRol } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

import {
  ANCHO_MAX_FOTO,
  BUCKET_MEMORIAS,
  CALIDAD_JPEG,
  construirRutaFoto,
  esImagenPermitida,
  normalizarReordenamiento,
  siguienteOrden,
  TAMANO_MAX_FOTO_BYTES,
} from "./logica";
import { galeriaSchema, reordenFotosSchema } from "./schemas";

/** Resultado uniforme de las acciones para que el cliente muestre errores. */
export type ResultadoAccion =
  | { ok: true; mensaje: string; id?: string }
  | { ok: false; mensaje: string; errores?: Record<string, string[]> };

const RUTA_LISTA = "/admin/memorias";

/** Autoriza (solo admin) y devuelve el id del actor, o un resultado de error. */
async function autorizar(): Promise<
  { ok: true; actorId: string } | { ok: false; resultado: ResultadoAccion }
> {
  try {
    const { user } = await requireRol(["admin"]);
    return { ok: true, actorId: user.id };
  } catch (e) {
    if (e instanceof ErrorAutorizacion) {
      return { ok: false, resultado: { ok: false, mensaje: e.message } };
    }
    throw e;
  }
}

async function registrarAuditoria(
  actorId: string,
  accion: string,
  entidadId: string,
): Promise<void> {
  try {
    await db.insert(auditLog).values({
      actor: actorId,
      accion,
      entidad: "gallery",
      entidadId,
    });
  } catch {
    // La auditoría es best-effort: no debe bloquear la operación principal.
  }
}

// ---------------------------------------------------------------------------
// Galerías
// ---------------------------------------------------------------------------

/** Crea una galería a partir de los metadatos del formulario. */
export async function crearGaleria(
  formData: FormData,
): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  const parsed = galeriaSchema.safeParse({
    titulo: formData.get("titulo"),
    anio: formData.get("anio"),
    eventoId: leerEventoId(formData),
    publicada: formData.get("publicada") === "on" || formData.get("publicada") === "true",
  });
  if (!parsed.success) {
    return {
      ok: false,
      mensaje: "Revisa los campos marcados.",
      errores: parsed.error.flatten().fieldErrors,
    };
  }

  const [creada] = await db
    .insert(galleries)
    .values({
      titulo: parsed.data.titulo,
      anio: parsed.data.anio,
      eventoId: parsed.data.eventoId ?? null,
      publicada: parsed.data.publicada,
    })
    .returning({ id: galleries.id });

  await registrarAuditoria(auth.actorId, "gallery.create", creada.id);
  revalidatePath(RUTA_LISTA);
  return { ok: true, mensaje: "Galería creada.", id: creada.id };
}

/** Actualiza los metadatos de una galería existente. */
export async function actualizarGaleria(
  galeriaId: string,
  formData: FormData,
): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  const parsed = galeriaSchema.safeParse({
    titulo: formData.get("titulo"),
    anio: formData.get("anio"),
    eventoId: leerEventoId(formData),
    publicada: formData.get("publicada") === "on" || formData.get("publicada") === "true",
  });
  if (!parsed.success) {
    return {
      ok: false,
      mensaje: "Revisa los campos marcados.",
      errores: parsed.error.flatten().fieldErrors,
    };
  }

  await db
    .update(galleries)
    .set({
      titulo: parsed.data.titulo,
      anio: parsed.data.anio,
      eventoId: parsed.data.eventoId ?? null,
      publicada: parsed.data.publicada,
    })
    .where(eq(galleries.id, galeriaId));

  await registrarAuditoria(auth.actorId, "gallery.update", galeriaId);
  revalidatePath(RUTA_LISTA);
  revalidatePath(`${RUTA_LISTA}/${galeriaId}`);
  return { ok: true, mensaje: "Galería actualizada." };
}

/** Alterna el estado de publicación de una galería. */
export async function alternarPublicada(
  galeriaId: string,
  publicada: boolean,
): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  await db
    .update(galleries)
    .set({ publicada })
    .where(eq(galleries.id, galeriaId));

  await registrarAuditoria(
    auth.actorId,
    publicada ? "gallery.publish" : "gallery.unpublish",
    galeriaId,
  );
  revalidatePath(RUTA_LISTA);
  revalidatePath(`${RUTA_LISTA}/${galeriaId}`);
  return {
    ok: true,
    mensaje: publicada ? "Galería publicada." : "Galería oculta.",
  };
}

/** Elimina una galería, sus fotos (cascada en BD) y sus objetos de Storage. */
export async function eliminarGaleria(
  galeriaId: string,
): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  const fotos = await db
    .select({ storagePath: galleryPhotos.storagePath })
    .from(galleryPhotos)
    .where(eq(galleryPhotos.galleryId, galeriaId));

  if (fotos.length > 0) {
    const supabase = createAdminClient();
    await supabase.storage
      .from(BUCKET_MEMORIAS)
      .remove(fotos.map((f) => f.storagePath));
  }

  // gallery_photos cae por ON DELETE CASCADE del esquema.
  await db.delete(galleries).where(eq(galleries.id, galeriaId));

  await registrarAuditoria(auth.actorId, "gallery.delete", galeriaId);
  revalidatePath(RUTA_LISTA);
  return { ok: true, mensaje: "Galería eliminada." };
}

// ---------------------------------------------------------------------------
// Fotos
// ---------------------------------------------------------------------------

/**
 * Sube una o varias fotos a una galería. Cada imagen se comprime con sharp
 * (auto-orientación, reescalado a ancho máximo, JPEG) antes de subirla al
 * bucket privado. Inserta las filas con orden incremental.
 */
export async function subirFotos(
  galeriaId: string,
  formData: FormData,
): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  const galeria = (
    await db
      .select({ id: galleries.id, anio: galleries.anio, portada: galleries.portada })
      .from(galleries)
      .where(eq(galleries.id, galeriaId))
      .limit(1)
  )[0];
  if (!galeria) {
    return { ok: false, mensaje: "La galería no existe." };
  }

  const archivos = formData
    .getAll("fotos")
    .filter((v): v is File => v instanceof File && v.size > 0);
  if (archivos.length === 0) {
    return { ok: false, mensaje: "Selecciona al menos una foto." };
  }

  for (const archivo of archivos) {
    if (!esImagenPermitida(archivo.type)) {
      return {
        ok: false,
        mensaje: `Formato no permitido en "${archivo.name}". Usa JPG, PNG o WebP.`,
      };
    }
    if (archivo.size > TAMANO_MAX_FOTO_BYTES) {
      return {
        ok: false,
        mensaje: `"${archivo.name}" excede el tamaño máximo de 8 MB.`,
      };
    }
  }

  // Orden inicial = después de las fotos existentes.
  const existentes = await db
    .select({ orden: galleryPhotos.orden })
    .from(galleryPhotos)
    .where(eq(galleryPhotos.galleryId, galeriaId))
    .orderBy(asc(galleryPhotos.orden));
  let orden = siguienteOrden(existentes.map((f) => f.orden));

  const supabase = createAdminClient();
  let primeraRuta: string | null = null;
  let subidas = 0;

  for (const archivo of archivos) {
    const id = randomUUID();
    const ruta = construirRutaFoto({ anio: galeria.anio, galeriaId, id });

    const entrada = Buffer.from(await archivo.arrayBuffer());
    let comprimida: Buffer;
    try {
      comprimida = await sharp(entrada)
        .rotate()
        .resize({ width: ANCHO_MAX_FOTO, withoutEnlargement: true })
        .jpeg({ quality: CALIDAD_JPEG, mozjpeg: true })
        .toBuffer();
    } catch {
      return {
        ok: false,
        mensaje: `No se pudo procesar la imagen "${archivo.name}".`,
      };
    }

    const { error } = await supabase.storage
      .from(BUCKET_MEMORIAS)
      .upload(ruta, comprimida, {
        contentType: "image/jpeg",
        upsert: false,
      });
    if (error) {
      return {
        ok: false,
        mensaje: `Fallo al subir "${archivo.name}" al almacenamiento.`,
      };
    }

    await db.insert(galleryPhotos).values({
      id,
      galleryId: galeriaId,
      storagePath: ruta,
      orden,
    });

    if (primeraRuta === null) primeraRuta = ruta;
    orden += 1;
    subidas += 1;
  }

  // Si la galería no tenía portada, usa la primera foto subida.
  if (!galeria.portada && primeraRuta) {
    await db
      .update(galleries)
      .set({ portada: primeraRuta })
      .where(eq(galleries.id, galeriaId));
  }

  await registrarAuditoria(auth.actorId, "gallery.photos.upload", galeriaId);
  revalidatePath(`${RUTA_LISTA}/${galeriaId}`);
  revalidatePath(RUTA_LISTA);
  return {
    ok: true,
    mensaje: `${subidas} foto(s) subida(s).`,
  };
}

/** Define la portada de una galería (debe ser una foto suya). */
export async function establecerPortada(
  galeriaId: string,
  storagePath: string,
): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  // Integridad: la foto debe pertenecer REALMENTE a esta galería. Verificar
  // solo por storagePath permitiría fijar como portada la foto de otra galería.
  const foto = (
    await db
      .select({ id: galleryPhotos.id })
      .from(galleryPhotos)
      .where(
        and(
          eq(galleryPhotos.storagePath, storagePath),
          eq(galleryPhotos.galleryId, galeriaId),
        ),
      )
      .limit(1)
  )[0];
  if (!foto) {
    return { ok: false, mensaje: "La foto no pertenece a esta galería." };
  }

  await db
    .update(galleries)
    .set({ portada: storagePath })
    .where(eq(galleries.id, galeriaId));

  await registrarAuditoria(auth.actorId, "gallery.cover.set", galeriaId);
  revalidatePath(`${RUTA_LISTA}/${galeriaId}`);
  revalidatePath(RUTA_LISTA);
  return { ok: true, mensaje: "Portada actualizada." };
}

/** Elimina una foto (Storage + fila). Reajusta la portada si era esa foto. */
export async function eliminarFoto(fotoId: string): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  const foto = (
    await db
      .select({
        galleryId: galleryPhotos.galleryId,
        storagePath: galleryPhotos.storagePath,
      })
      .from(galleryPhotos)
      .where(eq(galleryPhotos.id, fotoId))
      .limit(1)
  )[0];
  if (!foto) {
    return { ok: false, mensaje: "La foto no existe." };
  }

  const supabase = createAdminClient();
  await supabase.storage.from(BUCKET_MEMORIAS).remove([foto.storagePath]);
  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, fotoId));

  // Si esa foto era la portada, reasignar a la primera restante (o null).
  const galeria = (
    await db
      .select({ portada: galleries.portada })
      .from(galleries)
      .where(eq(galleries.id, foto.galleryId))
      .limit(1)
  )[0];
  if (galeria?.portada === foto.storagePath) {
    const restante = (
      await db
        .select({ storagePath: galleryPhotos.storagePath })
        .from(galleryPhotos)
        .where(eq(galleryPhotos.galleryId, foto.galleryId))
        .orderBy(asc(galleryPhotos.orden))
        .limit(1)
    )[0];
    await db
      .update(galleries)
      .set({ portada: restante?.storagePath ?? null })
      .where(eq(galleries.id, foto.galleryId));
  }

  await registrarAuditoria(auth.actorId, "gallery.photo.delete", fotoId);
  revalidatePath(`${RUTA_LISTA}/${foto.galleryId}`);
  revalidatePath(RUTA_LISTA);
  return { ok: true, mensaje: "Foto eliminada." };
}

/** Reordena las fotos de una galería según la lista de ids recibida. */
export async function reordenarFotos(
  galeriaId: string,
  ids: string[],
): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  const parsed = reordenFotosSchema.safeParse({ ids });
  if (!parsed.success) {
    return {
      ok: false,
      mensaje: "Reordenamiento inválido.",
      errores: parsed.error.flatten().fieldErrors,
    };
  }

  const nuevoOrden = normalizarReordenamiento(parsed.data.ids);

  // Integridad: cada foto a reordenar debe pertenecer REALMENTE a esta galería.
  // Sin esta verificación se podría alterar el orden de fotos de otra galería
  // pasando ids ajenos. Cargamos los ids propios y rechazamos cualquier intruso.
  const propias = await db
    .select({ id: galleryPhotos.id })
    .from(galleryPhotos)
    .where(eq(galleryPhotos.galleryId, galeriaId));
  const idsPropios = new Set(propias.map((f) => f.id));
  const ajena = nuevoOrden.find(({ id }) => !idsPropios.has(id));
  if (ajena) {
    return {
      ok: false,
      mensaje: "Una de las fotos no pertenece a esta galería.",
    };
  }

  for (const { id, orden } of nuevoOrden) {
    await db
      .update(galleryPhotos)
      .set({ orden })
      .where(
        and(eq(galleryPhotos.id, id), eq(galleryPhotos.galleryId, galeriaId)),
      );
  }

  await registrarAuditoria(auth.actorId, "gallery.photos.reorder", galeriaId);
  revalidatePath(`${RUTA_LISTA}/${galeriaId}`);
  return { ok: true, mensaje: "Orden actualizado." };
}

/** Lee y normaliza el campo eventoId del formulario ("" → null). */
function leerEventoId(formData: FormData): string | null {
  const valor = formData.get("eventoId");
  if (typeof valor !== "string" || valor.trim() === "") return null;
  return valor;
}
