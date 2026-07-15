/**
 * Wrapper de correo transaccional con Resend — PLAN.md §1.2 / §2.19.
 *
 * - Lee `RESEND_API_KEY` y `EMAIL_FROM` de process.env; cero llaves en código.
 * - Modo desarrollo sin credenciales: si `RESEND_API_KEY` no está definida,
 *   NO falla — loguea el correo en consola y devuelve `{ simulado: true }`,
 *   para que los flujos (registro, confirmación de pago, notificaciones
 *   documentales) sean probables en local sin servicios vivos.
 * - Las plantillas son componentes React Email versionados en el repo;
 *   este wrapper solo recibe el elemento ya construido en `react`.
 */
import type { ReactElement } from "react";

import { Resend } from "resend";

/** Remitente por defecto documentado en .env.example. */
const REMITENTE_DEFAULT = "notificaciones@comenor.org.mx";

/** Parámetros de un correo transaccional. */
export interface CorreoTransaccional {
  /** Destinatario(s). */
  to: string | string[];
  /** Asunto, en español. */
  subject: string;
  /** Plantilla React Email ya instanciada. */
  react: ReactElement;
  /** Responder-a opcional (p. ej. contacto@comenor.org.mx). */
  replyTo?: string;
}

/** Resultado del envío. */
export type ResultadoEnvio =
  | { simulado: true }
  | { simulado: false; id: string };

/**
 * Envía un correo transaccional vía Resend.
 * Sin `RESEND_API_KEY` (dev): imprime en consola y devuelve `{ simulado: true }`.
 * Con key: envía de verdad; si Resend reporta error, lanza (el caller decide
 * si el flujo es crítico — p. ej. reintentar el QR de un pago aprobado).
 */
export async function enviarCorreo(
  correo: CorreoTransaccional,
): Promise<ResultadoEnvio> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || REMITENTE_DEFAULT;

  if (!apiKey) {
    console.log(
      `[email simulado] para: ${Array.isArray(correo.to) ? correo.to.join(", ") : correo.to} | asunto: "${correo.subject}" | from: ${from} (RESEND_API_KEY no configurada — no se envió nada)`,
    );
    return { simulado: true };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: correo.to,
    subject: correo.subject,
    react: correo.react,
    ...(correo.replyTo ? { replyTo: correo.replyTo } : {}),
  });

  if (error || !data) {
    throw new Error(
      `Resend no pudo enviar "${correo.subject}": ${error?.message ?? "respuesta vacía"}`,
    );
  }

  return { simulado: false, id: data.id };
}
