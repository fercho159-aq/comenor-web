/**
 * Lecturas a base de datos del módulo Memorias.
 * SOLO SERVIDOR: `@/db` abre conexión a Postgres (requiere DATABASE_URL).
 * Aisladas para poder mockearse en pruebas de las páginas/acciones.
 */
import "server-only";

import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  events,
  galleries,
  galleryPhotos,
  type Event,
  type Gallery,
  type GalleryPhoto,
} from "@/db/schema";

/** Galería con el número de fotos que contiene (para el listado). */
export type GaleriaConConteo = Gallery & { totalFotos: number };

/** Lista todas las galerías, más recientes primero, con su conteo de fotos. */
export async function listarGalerias(): Promise<GaleriaConConteo[]> {
  const filas = await db
    .select()
    .from(galleries)
    .orderBy(desc(galleries.anio), asc(galleries.orden), desc(galleries.createdAt));

  const fotos = await db
    .select({ galleryId: galleryPhotos.galleryId })
    .from(galleryPhotos);

  const conteo = new Map<string, number>();
  for (const f of fotos) {
    conteo.set(f.galleryId, (conteo.get(f.galleryId) ?? 0) + 1);
  }

  return filas.map((g) => ({ ...g, totalFotos: conteo.get(g.id) ?? 0 }));
}

/** Galería por id, o `null` si no existe. */
export async function obtenerGaleria(id: string): Promise<Gallery | null> {
  const filas = await db
    .select()
    .from(galleries)
    .where(eq(galleries.id, id))
    .limit(1);
  return filas[0] ?? null;
}

/** Fotos de una galería en orden de exhibición (orden asc, luego antigüedad). */
export async function listarFotos(galeriaId: string): Promise<GalleryPhoto[]> {
  return db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.galleryId, galeriaId))
    .orderBy(asc(galleryPhotos.orden), asc(galleryPhotos.createdAt));
}

/** Eventos disponibles para asociar a una galería (nombre + id). */
export async function listarEventosParaAsociar(): Promise<
  Pick<Event, "id" | "nombre" | "fecha">[]
> {
  return db
    .select({ id: events.id, nombre: events.nombre, fecha: events.fecha })
    .from(events)
    .orderBy(desc(events.fecha));
}
