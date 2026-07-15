/**
 * Lógica de negocio del check-in por QR (PLAN.md §A3).
 *
 * Pura y sin dependencias de Next/Supabase: recibe el token y un
 * `RepositorioCheckin` (puerto de datos). Esto permite testear la regla de
 * "uso único" con un repositorio en memoria, sin base de datos viva.
 *
 * Contrato de uso único (ver src/lib/qr/token.ts):
 *   1. verificarToken(token) → si es inválido/alterado, se rechaza.
 *   2. Se busca el registro por hashParaBD(token) === registrations.qr_token_hash.
 *   3. Si ya tiene checked_in_at → "ya usado".
 *   4. `marcarCheckin` hace un UPDATE condicional `WHERE checked_in_at IS NULL`
 *      y devuelve la fila SOLO si él fue quien la marcó (atómico ante carreras).
 */
import { hashParaBD, verificarToken } from "@/lib/qr/token";

/** Fila mínima de `registrations` que necesita el check-in. */
export interface RegistroCheckin {
  id: string;
  eventId: string;
  nombre: string;
  cargo: string;
  correo: string;
  organismo: string;
  checkedInAt: Date | null;
}

/** Puerto de datos: implementado con Drizzle en el route handler. */
export interface RepositorioCheckin {
  /** Busca por hash del token (registrations.qr_token_hash). */
  buscarPorHash(hash: string): Promise<RegistroCheckin | null>;
  /**
   * UPDATE condicional: marca checked_in_at = now() SOLO si aún es NULL.
   * Devuelve la fila actualizada, o null si otra transacción ya la marcó.
   */
  marcarCheckin(id: string): Promise<RegistroCheckin | null>;
}

/** Datos del asistente que se devuelven al escanear correctamente. */
export interface AsistenteCheckin {
  registrationId: string;
  eventId: string;
  nombre: string;
  cargo: string;
  correo: string;
  organismo: string;
  checkedInAt: string;
}

/** Códigos de rechazo del check-in. */
export type MotivoRechazo =
  | "token_invalido"
  | "no_encontrado"
  | "ya_usado";

export type ResultadoCheckin =
  | { ok: true; asistente: AsistenteCheckin }
  | { ok: false; motivo: MotivoRechazo; mensaje: string };

const MENSAJES: Record<MotivoRechazo, string> = {
  token_invalido: "El código QR no es válido o fue alterado.",
  no_encontrado: "No se encontró un registro para este código QR.",
  ya_usado: "Este código QR ya fue usado para el acceso.",
};

function rechazo(motivo: MotivoRechazo): ResultadoCheckin {
  return { ok: false, motivo, mensaje: MENSAJES[motivo] };
}

/**
 * Procesa un token de QR escaneado y aplica la regla de uso único.
 */
export async function procesarCheckin(
  token: string,
  repo: RepositorioCheckin,
): Promise<ResultadoCheckin> {
  const verificacion = verificarToken(token);
  if (!verificacion.valido) return rechazo("token_invalido");

  const hash = hashParaBD(token);
  const registro = await repo.buscarPorHash(hash);
  if (!registro) return rechazo("no_encontrado");

  // El payload firmado debe corresponder al registro hallado por hash.
  // Si no coincide, el token no es de confianza para este registro.
  if (
    verificacion.payload.registrationId !== registro.id ||
    verificacion.payload.eventId !== registro.eventId
  ) {
    return rechazo("token_invalido");
  }

  // Rechazo temprano si ya está marcado (evita el UPDATE en el caso común).
  if (registro.checkedInAt !== null) return rechazo("ya_usado");

  const actualizado = await repo.marcarCheckin(registro.id);
  // null ⇒ otra transacción marcó primero (carrera): también es "ya usado".
  if (!actualizado || actualizado.checkedInAt === null) {
    return rechazo("ya_usado");
  }

  return {
    ok: true,
    asistente: {
      registrationId: actualizado.id,
      eventId: actualizado.eventId,
      nombre: actualizado.nombre,
      cargo: actualizado.cargo,
      correo: actualizado.correo,
      organismo: actualizado.organismo,
      checkedInAt: actualizado.checkedInAt.toISOString(),
    },
  };
}
