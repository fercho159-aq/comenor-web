/**
 * Acceso a datos (lectura) del panel admin de eventos.
 *
 * A diferencia del calendario público (`src/app/eventos/_datos.ts`), aquí se
 * listan TODOS los eventos —incluidos borradores y no publicados— porque es la
 * vista de gestión. La autorización (`admin`) la resuelve la página antes de
 * llamar a estas funciones.
 *
 * SOLO SERVIDOR. El prefijo `_` marca la carpeta como privada del App Router.
 */
import { count, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { events, registrations, type Event } from "@/db/schema";

/** Evento con su número de registros que ocupan lugar (no rechazados). */
export interface EventoAdmin extends Event {
  registrados: number;
}

/**
 * Lista todos los eventos ordenados por fecha descendente (los más próximos /
 * recientes primero) con su conteo de registros activos.
 */
export async function listarEventosAdmin(): Promise<EventoAdmin[]> {
  const filas = await db.select().from(events).orderBy(desc(events.fecha));

  if (filas.length === 0) return [];

  const conteos = await db
    .select({ eventId: registrations.eventId, total: count() })
    .from(registrations)
    .groupBy(registrations.eventId);

  const porEvento = new Map<string, number>();
  for (const fila of conteos) {
    porEvento.set(fila.eventId, Number(fila.total));
  }

  return filas.map((evento) => ({
    ...evento,
    registrados: porEvento.get(evento.id) ?? 0,
  }));
}

/** Devuelve un evento por su id, o null si no existe. */
export async function buscarEventoPorId(id: string): Promise<Event | null> {
  const filas = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
  return filas[0] ?? null;
}
