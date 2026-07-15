/**
 * Acceso a datos del módulo de eventos (lado escritura / API).
 *
 * Se aísla del route handler para que las pruebas unitarias puedan mockear la
 * capa de base de datos sin levantar Postgres (drizzle) — cada regla de negocio
 * del handler se prueba contra estas funciones, no contra el pool real.
 *
 * El prefijo `_` marca la carpeta como privada para el App Router (no genera
 * ruta).
 */
import { and, count, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  events,
  registrations,
  type Event,
  type NewRegistration,
  type Registration,
} from "@/db/schema";

/** Devuelve el evento con ese slug, o null si no existe. */
export async function buscarEventoPorSlug(slug: string): Promise<Event | null> {
  const filas = await db
    .select()
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1);
  return filas[0] ?? null;
}

/**
 * Cuenta los registros que ocupan cupo de un evento: todos menos los
 * `rechazado`. Los `pendiente` cuentan para no sobrevender mientras el pago se
 * resuelve.
 */
export async function contarRegistrosActivos(eventId: string): Promise<number> {
  const filas = await db
    .select({ total: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, eventId),
        ne(registrations.estadoPago, "rechazado"),
      ),
    );
  return Number(filas[0]?.total ?? 0);
}

/** Inserta un registro y devuelve la fila creada (con su id generado). */
export async function crearRegistro(
  datos: NewRegistration,
): Promise<Registration> {
  const [fila] = await db.insert(registrations).values(datos).returning();
  if (!fila) {
    throw new Error("No se pudo crear el registro.");
  }
  return fila;
}

/** Persiste SOLO el hash del token QR en el registro (nunca el token). */
export async function guardarHashQr(
  registrationId: string,
  hash: string,
): Promise<void> {
  await db
    .update(registrations)
    .set({ qrTokenHash: hash })
    .where(eq(registrations.id, registrationId));
}
