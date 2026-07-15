import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { firmarToken, hashParaBD } from "@/lib/qr/token";
import {
  procesarCheckin,
  type RegistroCheckin,
  type RepositorioCheckin,
} from "../logic";

const SECRETO = "qr-secreto-de-prueba";
const REGISTRO_ID = "11111111-1111-1111-1111-111111111111";
const EVENT_ID = "22222222-2222-2222-2222-222222222222";

/**
 * Repositorio en memoria que imita la semántica atómica de la BD:
 * `marcarCheckin` solo escribe si checkedInAt sigue en NULL, y devuelve la
 * fila únicamente en ese caso (como el UPDATE ... WHERE checked_in_at IS NULL).
 */
function crearRepo(registro: RegistroCheckin | null): RepositorioCheckin {
  return {
    async buscarPorHash(hash) {
      if (!registro) return null;
      const esperado = hashParaBD(
        firmarToken({
          registrationId: registro.id,
          eventId: registro.eventId,
        }),
      );
      return hash === esperado ? { ...registro } : null;
    },
    async marcarCheckin(id) {
      if (!registro || registro.id !== id) return null;
      if (registro.checkedInAt !== null) return null; // ya marcado ⇒ carrera perdida
      registro.checkedInAt = new Date("2026-07-14T18:00:00.000Z");
      return { ...registro };
    },
  };
}

function registroBase(): RegistroCheckin {
  return {
    id: REGISTRO_ID,
    eventId: EVENT_ID,
    nombre: "María Fernández",
    cargo: "Directora",
    correo: "maria@organismo.mx",
    organismo: "Organismo de Certificación Ñandú",
    checkedInAt: null,
  };
}

describe("procesarCheckin (uso único del QR)", () => {
  beforeEach(() => {
    vi.stubEnv("QR_SIGNING_SECRET", SECRETO);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("un token válido y no usado concede acceso y marca check-in", async () => {
    const registro = registroBase();
    const token = firmarToken({ registrationId: REGISTRO_ID, eventId: EVENT_ID });

    const resultado = await procesarCheckin(token, crearRepo(registro));

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.asistente.registrationId).toBe(REGISTRO_ID);
      expect(resultado.asistente.nombre).toBe("María Fernández");
      expect(resultado.asistente.checkedInAt).toBe("2026-07-14T18:00:00.000Z");
    }
    // El registro quedó marcado.
    expect(registro.checkedInAt).not.toBeNull();
  });

  it("un token reutilizado es rechazado en el segundo intento (uso único)", async () => {
    const registro = registroBase();
    const repo = crearRepo(registro);
    const token = firmarToken({ registrationId: REGISTRO_ID, eventId: EVENT_ID });

    const primero = await procesarCheckin(token, repo);
    expect(primero.ok).toBe(true);

    const segundo = await procesarCheckin(token, repo);
    expect(segundo.ok).toBe(false);
    if (!segundo.ok) expect(segundo.motivo).toBe("ya_usado");
  });

  it("un token alterado es rechazado", async () => {
    const registro = registroBase();
    const token = firmarToken({ registrationId: REGISTRO_ID, eventId: EVENT_ID });
    // Altera un carácter del cuerpo del token.
    const alterado =
      token[0] === "A" ? "B" + token.slice(1) : "A" + token.slice(1);

    const resultado = await procesarCheckin(alterado, crearRepo(registro));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.motivo).toBe("token_invalido");
    // No se tocó el registro.
    expect(registro.checkedInAt).toBeNull();
  });

  it("un token válido sin registro asociado responde no_encontrado", async () => {
    const token = firmarToken({ registrationId: REGISTRO_ID, eventId: EVENT_ID });

    const resultado = await procesarCheckin(token, crearRepo(null));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.motivo).toBe("no_encontrado");
  });

  it("un token cuyo payload no coincide con el registro es rechazado", async () => {
    // Registro real, pero el token firma OTRO registrationId.
    const registro = registroBase();
    const repo: RepositorioCheckin = {
      // Devuelve el registro para cualquier hash (simula colisión de búsqueda).
      async buscarPorHash() {
        return { ...registro };
      },
      async marcarCheckin() {
        throw new Error("no debe marcarse");
      },
    };
    const tokenOtro = firmarToken({
      registrationId: "99999999-9999-9999-9999-999999999999",
      eventId: EVENT_ID,
    });

    const resultado = await procesarCheckin(tokenOtro, repo);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.motivo).toBe("token_invalido");
  });
});
