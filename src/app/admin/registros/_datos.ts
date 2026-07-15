/**
 * Acceso a datos del panel admin de registros (solo lectura).
 *
 * Vive dentro de la carpeta del panel porque no existe un route handler de
 * LISTADO de registros (el API solo expone export .xlsx y check-in). No hay
 * lógica de negocio aquí: son consultas de lectura para pintar la tabla del
 * panel, que ya está protegido por el middleware admin y por `requireRol` en
 * las páginas que consumen estas funciones.
 *
 * El prefijo `_` marca la carpeta como privada para el App Router (no genera
 * ruta).
 */
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { events, registrations } from "@/db/schema";

/** Datos mínimos de un evento para el selector del panel. */
export interface EventoResumen {
  id: string;
  nombre: string;
  slug: string;
  fecha: Date;
  cupo: number | null;
}

/** Fila de registro que consume la tabla del panel. */
export interface RegistroFila {
  id: string;
  nombre: string;
  cargo: string;
  correo: string;
  celular: string;
  organismo: string;
  solicitante: string;
  estadoPago: (typeof registrations.$inferSelect)["estadoPago"];
  checkedInAt: Date | null;
  createdAt: Date;
}

/** Lista todos los eventos (más recientes primero) para elegir cuál gestionar. */
export async function listarEventos(): Promise<EventoResumen[]> {
  return db
    .select({
      id: events.id,
      nombre: events.nombre,
      slug: events.slug,
      fecha: events.fecha,
      cupo: events.cupo,
    })
    .from(events)
    .orderBy(desc(events.fecha));
}

/** Devuelve el resumen de un evento por id, o null si no existe. */
export async function buscarEvento(
  eventId: string,
): Promise<EventoResumen | null> {
  const filas = await db
    .select({
      id: events.id,
      nombre: events.nombre,
      slug: events.slug,
      fecha: events.fecha,
      cupo: events.cupo,
    })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  return filas[0] ?? null;
}

/** Registros de un evento, del más reciente al más antiguo. */
export async function listarRegistrosDeEvento(
  eventId: string,
): Promise<RegistroFila[]> {
  return db
    .select({
      id: registrations.id,
      nombre: registrations.nombre,
      cargo: registrations.cargo,
      correo: registrations.correo,
      celular: registrations.celular,
      organismo: registrations.organismo,
      solicitante: registrations.solicitante,
      estadoPago: registrations.estadoPago,
      checkedInAt: registrations.checkedInAt,
      createdAt: registrations.createdAt,
    })
    .from(registrations)
    .where(eq(registrations.eventId, eventId))
    .orderBy(desc(registrations.createdAt));
}
