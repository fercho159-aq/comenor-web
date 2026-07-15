/**
 * Acceso a datos del calendario público de eventos (lado lectura).
 *
 * Solo expone eventos PUBLICADOS. El cupo restante se calcula contando los
 * registros que ocupan lugar (todos menos los `rechazado`).
 *
 * El prefijo `_` marca la carpeta como privada para el App Router.
 */
import { and, asc, count, eq, gte, ne } from "drizzle-orm";

import { db } from "@/db";
import { events, registrations, type Event } from "@/db/schema";

/** Evento publicado con su cupo calculado para las tarjetas del calendario. */
export interface EventoConCupo extends Event {
  /** Registros que ocupan lugar. */
  registrados: number;
  /** Lugares restantes; `null` = cupo ilimitado. */
  cupoRestante: number | null;
  /** true si el cupo se agotó. */
  agotado: boolean;
  /** true si se puede registrar (abierto, con estado activo y con lugar). */
  registrable: boolean;
}

const ESTADOS_ABIERTOS: ReadonlyArray<Event["estado"]> = [
  "programado",
  "en_curso",
];

function componer(evento: Event, registrados: number): EventoConCupo {
  const cupoRestante =
    evento.cupo === null ? null : Math.max(0, evento.cupo - registrados);
  const agotado = cupoRestante !== null && cupoRestante === 0;
  const abierto =
    evento.registroAbierto && ESTADOS_ABIERTOS.includes(evento.estado);
  return {
    ...evento,
    registrados,
    cupoRestante,
    agotado,
    registrable: abierto && !agotado,
  };
}

/**
 * Lista los eventos publicados con fecha futura (o de hoy en adelante),
 * ordenados por fecha ascendente, con su cupo restante ya calculado.
 */
export async function listarEventosPublicadosFuturos(): Promise<EventoConCupo[]> {
  const ahora = new Date();

  const filas = await db
    .select()
    .from(events)
    .where(and(eq(events.publicado, true), gte(events.fecha, ahora)))
    .orderBy(asc(events.fecha));

  if (filas.length === 0) return [];

  const conteos = await db
    .select({ eventId: registrations.eventId, total: count() })
    .from(registrations)
    .where(ne(registrations.estadoPago, "rechazado"))
    .groupBy(registrations.eventId);

  const porEvento = new Map<string, number>();
  for (const fila of conteos) {
    porEvento.set(fila.eventId, Number(fila.total));
  }

  return filas.map((evento) => componer(evento, porEvento.get(evento.id) ?? 0));
}

/**
 * Devuelve un evento publicado por su slug (con cupo), o null si no existe o no
 * está publicado.
 */
export async function buscarEventoPublicadoPorSlug(
  slug: string,
): Promise<EventoConCupo | null> {
  const filas = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.publicado, true)))
    .limit(1);

  const evento = filas[0];
  if (!evento) return null;

  const conteo = await db
    .select({ total: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, evento.id),
        ne(registrations.estadoPago, "rechazado"),
      ),
    );

  return componer(evento, Number(conteo[0]?.total ?? 0));
}
