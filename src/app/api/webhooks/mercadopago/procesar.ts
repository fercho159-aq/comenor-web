/**
 * Orquestación del webhook de Mercado Pago (PLAN.md §2.3).
 *
 * Reglas de negocio (todas con test unitario, mockeando repo/MP/correo):
 *  1. El monto y el estado NUNCA se leen del body: se consultan a la API de MP
 *     (`consultarPago`) y se comparan contra `events.costo_centavos`.
 *  2. Idempotencia por `mp_payment_id`: un mismo pago no genera un segundo QR ni
 *     un segundo correo. Se apoya en el índice único de
 *     `registrations.mp_payment_id` + un UPDATE condicional que "reclama" el pago
 *     (fila afectada == 0 ⇒ ya estaba procesado ⇒ no se reprocesa).
 *  3. Aprobado ⇒ `estado_pago='aprobado'`, se firma el QR (hash a BD) y se encola
 *     el correo. Rechazado/cancelado ⇒ `estado_pago='rechazado'`, sin QR ni correo.
 *
 * Esta función es PURA respecto de la infraestructura: recibe sus dependencias
 * inyectadas (repo, consultarPago, enviarConfirmacion). El route handler pasa la
 * implementación real; los tests pasan mocks.
 */
import { firmarToken, hashParaBD } from "@/lib/qr/token";

// ---------------------------------------------------------------------------
// Tipos de dominio (subconjuntos de las filas reales del schema Drizzle)
// ---------------------------------------------------------------------------

export type EstadoPago = "gratuito" | "pendiente" | "aprobado" | "rechazado";
export type Modalidad = "presencial" | "virtual" | "hibrida";

export interface RegistroConEvento {
  registro: {
    id: string;
    nombre: string;
    correo: string;
    estadoPago: EstadoPago;
    mpPaymentId: string | null;
  };
  evento: {
    id: string;
    nombre: string;
    fecha: Date;
    sede: string;
    modalidad: Modalidad;
    costoCentavos: number;
    slug: string;
  };
}

/** Acceso a BD para el webhook. Lo implementa `repositorio.ts` con Drizzle. */
export interface RepositorioPagos {
  obtenerRegistroConEvento(
    registrationId: string,
  ): Promise<RegistroConEvento | null>;
  /** UPDATE condicional; devuelve nº de filas afectadas (0 ⇒ ya aprobado). */
  marcarAprobado(datos: {
    registrationId: string;
    paymentId: string;
    qrTokenHash: string;
  }): Promise<number>;
  marcarRechazado(datos: {
    registrationId: string;
    paymentId: string;
  }): Promise<number>;
  registrarBitacora(datos: {
    registrationId: string;
    mpPaymentId: string;
    mpEvent: string;
    payload: unknown;
  }): Promise<void>;
}

/** Datos que necesita el correo de confirmación con su QR. */
export interface DatosConfirmacion {
  correo: string;
  nombre: string;
  folio: string;
  montoCentavos: number;
  /** Token firmado a incrustar como QR. */
  token: string;
  evento: {
    nombre: string;
    fecha: Date;
    sede: string;
    modalidad: Modalidad;
    slug: string;
  };
}

/** Pago tal como lo devuelve `consultarPago` de @/lib/mercadopago/client. */
export interface PagoConsultado {
  id: string;
  estado: string;
  montoCentavos: number;
  moneda: string;
  externalReference: string | null;
}

export interface DependenciasWebhook {
  consultarPago: (paymentId: string) => Promise<PagoConsultado>;
  repo: RepositorioPagos;
  enviarConfirmacion: (datos: DatosConfirmacion) => Promise<void>;
}

export type ResultadoProceso =
  | { estado: "ignorado"; motivo: string }
  | { estado: "duplicado" }
  | { estado: "monto_invalido"; esperadoCentavos: number; recibidoCentavos: number }
  | { estado: "aprobado"; registrationId: string }
  | { estado: "rechazado"; registrationId: string };

// Estados terminales de MP que consideramos "rechazo".
const ESTADOS_RECHAZO = new Set(["rejected", "cancelled", "refunded", "charged_back"]);

// ---------------------------------------------------------------------------
// Orquestador
// ---------------------------------------------------------------------------

/**
 * Procesa una notificación de pago ya autenticada (firma válida verificada por
 * el route handler). Devuelve un resultado tipado; el handler responde 200 en
 * todos los casos manejados y deja que MP reintente sólo ante excepción (500).
 */
export async function procesarPago(
  paymentId: string,
  mpEvent: string,
  deps: DependenciasWebhook,
  payloadCrudo: unknown,
): Promise<ResultadoProceso> {
  const pago = await deps.consultarPago(paymentId);

  const registrationId = pago.externalReference;
  if (!registrationId) {
    return { estado: "ignorado", motivo: "El pago no trae external_reference." };
  }

  const datos = await deps.repo.obtenerRegistroConEvento(registrationId);
  if (!datos) {
    return {
      estado: "ignorado",
      motivo: `No existe el registro ${registrationId}.`,
    };
  }
  const { registro, evento } = datos;

  // Idempotencia: NO se hace un pre-check por estado terminal, porque un
  // reembolso / contracargo (`refunded`/`charged_back`) llega con el MISMO
  // payment_id que la aprobación previa y DEBE poder revertir un registro ya
  // "aprobado". La deduplicación real vive en los UPDATE condicionales de más
  // abajo (`marcarAprobado` WHERE estado<>'aprobado', `marcarRechazado` WHERE
  // estado<>'rechazado'): una notificación repetida del mismo estado afecta 0
  // filas y se reporta como duplicado, mientras que una transición legítima
  // (aprobado → rechazado por contracargo) sí procede. `payments_log` añade una
  // segunda red con su índice único (mp_payment_id, mp_event).

  if (pago.estado === "approved") {
    // NUNCA confiar en el monto del cliente: comparamos el monto REAL de MP
    // contra el costo del evento en BD. Cualquier discrepancia ⇒ no se aprueba.
    if (pago.moneda !== "MXN" || pago.montoCentavos !== evento.costoCentavos) {
      await deps.repo.registrarBitacora({
        registrationId,
        mpPaymentId: paymentId,
        mpEvent: `${mpEvent}:monto_invalido`,
        payload: payloadCrudo,
      });
      return {
        estado: "monto_invalido",
        esperadoCentavos: evento.costoCentavos,
        recibidoCentavos: pago.montoCentavos,
      };
    }

    const token = firmarToken({ registrationId, eventId: evento.id });
    const qrTokenHash = hashParaBD(token);

    // Reclamo atómico: sólo la primera notificación que gane el UPDATE envía QR.
    const filas = await deps.repo.marcarAprobado({
      registrationId,
      paymentId,
      qrTokenHash,
    });
    if (filas === 0) {
      return { estado: "duplicado" };
    }

    await deps.repo.registrarBitacora({
      registrationId,
      mpPaymentId: paymentId,
      mpEvent,
      payload: payloadCrudo,
    });

    await deps.enviarConfirmacion({
      correo: registro.correo,
      nombre: registro.nombre,
      folio: registro.id,
      montoCentavos: pago.montoCentavos,
      token,
      evento: {
        nombre: evento.nombre,
        fecha: evento.fecha,
        sede: evento.sede,
        modalidad: evento.modalidad,
        slug: evento.slug,
      },
    });

    return { estado: "aprobado", registrationId };
  }

  if (ESTADOS_RECHAZO.has(pago.estado)) {
    // Incluye reembolso/contracargo: marcarRechazado transiciona desde
    // 'aprobado' y ANULA el QR (qr_token_hash → null), de modo que un pago
    // revertido ya no permite check-in.
    const filas = await deps.repo.marcarRechazado({ registrationId, paymentId });
    if (filas === 0) {
      return { estado: "duplicado" };
    }
    await deps.repo.registrarBitacora({
      registrationId,
      mpPaymentId: paymentId,
      mpEvent,
      payload: payloadCrudo,
    });
    return { estado: "rechazado", registrationId };
  }

  // pending / in_process / authorized / desconocido: aún no es terminal.
  return {
    estado: "ignorado",
    motivo: `Estado no terminal de MP: ${pago.estado}.`,
  };
}
