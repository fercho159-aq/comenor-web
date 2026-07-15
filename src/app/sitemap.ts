import type { MetadataRoute } from "next";

import { SITIO_URL } from "@/lib/site";

/** Rutas públicas estáticas del sitio. */
const RUTAS_ESTATICAS = [
  "/",
  "/nosotros",
  "/consejo-directivo",
  "/asociados",
  "/eventos",
  "/normatividad",
  "/codigo-etica",
  "/ejes",
  "/contacto",
] as const;

/**
 * Sitemap. Incluye las rutas estáticas y, si la BD está disponible, los
 * eventos publicados (`/eventos/{slug}`). La consulta va en try/catch para que
 * el build nunca falle si no hay DATABASE_URL.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = RUTAS_ESTATICAS.map((ruta) => ({
    url: `${SITIO_URL}${ruta}`,
    changeFrequency: ruta === "/eventos" ? "weekly" : "monthly",
    priority: ruta === "/" ? 1 : 0.7,
  }));

  let eventos: MetadataRoute.Sitemap = [];
  try {
    const { db } = await import("@/db");
    const { events } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const filas = await db
      .select({ slug: events.slug, actualizado: events.updatedAt })
      .from(events)
      .where(eq(events.publicado, true));
    eventos = filas.map((e) => ({
      url: `${SITIO_URL}/eventos/${e.slug}`,
      lastModified: e.actualizado ?? undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // Sin BD en build: se publica el sitemap solo con las rutas estáticas.
  }

  return [...estaticas, ...eventos];
}
