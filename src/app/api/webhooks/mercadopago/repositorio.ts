/**
 * Implementación Drizzle del `RepositorioPagos` + fábrica de dependencias reales
 * del webhook. Sólo se usa en servidor.
 *
 * Idempotencia: UPDATE condicional de `marcarAprobado`/`marcarRechazado` (una
 * notificación repetida del mismo estado afecta 0 filas) + índice único
 * (mp_payment_id, mp_event) en `payments_log` como segunda red. Un contracargo
 * (mismo payment_id, mp_event distinto) sí revierte un registro aprobado.
 */
import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { events, paymentsLog, registrations } from "@/db/schema";
import { consultarPago } from "@/lib/mercadopago/client";

import { enviarConfirmacion } from "./confirmacion";
import type {
  DependenciasWebhook,
  Modalidad,
  RegistroConEvento,
  RepositorioPagos,
} from "./procesar";

export const repositorioDrizzle: RepositorioPagos = {
  async obtenerRegistroConEvento(
    registrationId: string,
  ): Promise<RegistroConEvento | null> {
    const filas = await db
      .select({
        registroId: registrations.id,
        nombre: registrations.nombre,
        correo: registrations.correo,
        estadoPago: registrations.estadoPago,
        mpPaymentId: registrations.mpPaymentId,
        eventoId: events.id,
        eventoNombre: events.nombre,
        eventoFecha: events.fecha,
        eventoSede: events.sede,
        eventoModalidad: events.modalidad,
        eventoCosto: events.costoCentavos,
        eventoSlug: events.slug,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(eq(registrations.id, registrationId))
      .limit(1);

    const fila = filas[0];
    if (!fila) return null;

    return {
      registro: {
        id: fila.registroId,
        nombre: fila.nombre,
        correo: fila.correo,
        estadoPago: fila.estadoPago,
        mpPaymentId: fila.mpPaymentId,
      },
      evento: {
        id: fila.eventoId,
        nombre: fila.eventoNombre,
        fecha: fila.eventoFecha,
        sede: fila.eventoSede,
        modalidad: fila.eventoModalidad as Modalidad,
        costoCentavos: fila.eventoCosto,
        slug: fila.eventoSlug,
      },
    };
  },

  async marcarAprobado({ registrationId, paymentId, qrTokenHash }) {
    const filas = await db
      .update(registrations)
      .set({ estadoPago: "aprobado", mpPaymentId: paymentId, qrTokenHash })
      .where(
        and(
          eq(registrations.id, registrationId),
          ne(registrations.estadoPago, "aprobado"),
        ),
      )
      .returning({ id: registrations.id });
    return filas.length;
  },

  async marcarRechazado({ registrationId, paymentId }) {
    const filas = await db
      .update(registrations)
      // qrTokenHash → null ANULA el QR: el check-in busca por hash y ya no lo
      // encontrará. Cubre reembolso/contracargo sobre un registro aprobado.
      .set({ estadoPago: "rechazado", mpPaymentId: paymentId, qrTokenHash: null })
      .where(
        and(
          eq(registrations.id, registrationId),
          ne(registrations.estadoPago, "rechazado"),
        ),
      )
      .returning({ id: registrations.id });
    return filas.length;
  },

  async registrarBitacora({ registrationId, mpPaymentId, mpEvent, payload }) {
    // onConflictDoNothing contra el índice único (mp_payment_id, mp_event): una
    // notificación idéntica repetida no rompe con violación de unicidad.
    await db
      .insert(paymentsLog)
      .values({
        registrationId,
        mpPaymentId,
        mpEvent,
        payloadJson: payload,
      })
      .onConflictDoNothing();
  },
};

/** Dependencias reales del webhook (BD Drizzle + MP + correo Resend). */
export function crearDependenciasWebhook(): DependenciasWebhook {
  return {
    consultarPago,
    repo: repositorioDrizzle,
    enviarConfirmacion,
  };
}
