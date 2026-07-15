/**
 * QR firmado — PLAN.md §2.4.
 *
 * Token = payload en base64url + firma HMAC-SHA256 con `QR_SIGNING_SECRET`.
 * En la BD se guarda SOLO `hashParaBD(token)` (SHA-256), nunca el token:
 * si la BD se filtra, el hash no permite reconstruir ni falsificar tokens.
 *
 * CONTRATO DE USO ÚNICO: este módulo solo firma y verifica. La marca de
 * "uso único" es responsabilidad del flujo de check-in, que debe:
 *   1. `verificarToken(token)` → rechazar si `valido === false`.
 *   2. Buscar el registro por `hashParaBD(token)` === `registrations.qr_token_hash`.
 *   3. Rechazar si `registrations.checked_in_at` ya tiene valor (QR ya usado).
 *   4. Marcar `checked_in_at = now()` en la MISMA transacción (evita doble check-in
 *      concurrente con un UPDATE condicional `WHERE checked_in_at IS NULL`).
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Payload firmado dentro del QR. */
export interface QrPayload {
  /** UUID del registro (registrations.id). */
  registrationId: string;
  /** UUID del evento (events.id). */
  eventId: string;
}

/** Resultado de verificar un token. */
export type ResultadoVerificacion =
  | { valido: true; payload: QrPayload }
  | { valido: false; payload: null };

function obtenerSecreto(): string {
  const secreto = process.env.QR_SIGNING_SECRET;
  if (!secreto) {
    throw new Error(
      "QR_SIGNING_SECRET no está definido. Configúralo en .env.local (ver .env.example).",
    );
  }
  return secreto;
}

function firmar(datos: string, secreto: string): Buffer {
  return createHmac("sha256", secreto).update(datos).digest();
}

/**
 * Firma un payload de registro y devuelve el token para codificar en el QR.
 * Formato: `base64url(JSON payload).base64url(HMAC-SHA256(payload))`.
 */
export function firmarToken(payload: QrPayload): string {
  const secreto = obtenerSecreto();
  const cuerpo = Buffer.from(
    JSON.stringify({
      registrationId: payload.registrationId,
      eventId: payload.eventId,
    }),
    "utf8",
  ).toString("base64url");
  const firma = firmar(cuerpo, secreto).toString("base64url");
  return `${cuerpo}.${firma}`;
}

/**
 * Verifica un token de QR. Cualquier alteración (payload o firma) lo invalida.
 * Comparación en tiempo constante (`timingSafeEqual`) para evitar timing attacks.
 */
export function verificarToken(token: string): ResultadoVerificacion {
  const secreto = obtenerSecreto();
  const invalido: ResultadoVerificacion = { valido: false, payload: null };

  const partes = token.split(".");
  if (partes.length !== 2 || !partes[0] || !partes[1]) return invalido;
  const [cuerpo, firmaRecibidaB64] = partes;

  let firmaRecibida: Buffer;
  try {
    firmaRecibida = Buffer.from(firmaRecibidaB64, "base64url");
  } catch {
    return invalido;
  }

  const firmaEsperada = firmar(cuerpo, secreto);
  if (
    firmaRecibida.length !== firmaEsperada.length ||
    !timingSafeEqual(firmaRecibida, firmaEsperada)
  ) {
    return invalido;
  }

  try {
    const crudo: unknown = JSON.parse(
      Buffer.from(cuerpo, "base64url").toString("utf8"),
    );
    if (
      typeof crudo !== "object" ||
      crudo === null ||
      typeof (crudo as Record<string, unknown>).registrationId !== "string" ||
      typeof (crudo as Record<string, unknown>).eventId !== "string"
    ) {
      return invalido;
    }
    const datos = crudo as { registrationId: string; eventId: string };
    return {
      valido: true,
      payload: {
        registrationId: datos.registrationId,
        eventId: datos.eventId,
      },
    };
  } catch {
    return invalido;
  }
}

/**
 * Hash SHA-256 (hex) del token para persistir en `registrations.qr_token_hash`.
 * En BD se guarda SOLO este hash; el token completo viaja únicamente en el
 * correo/QR del asistente.
 */
export function hashParaBD(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
