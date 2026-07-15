import { createHash } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { firmarToken, hashParaBD, verificarToken } from "@/lib/qr/token";

const PAYLOAD = {
  registrationId: "8d1f4b1a-6a4e-4a7b-9f0e-1c2d3e4f5a6b",
  eventId: "0a9b8c7d-6e5f-4a3b-2c1d-0e9f8a7b6c5d",
};

describe("QR firmado (src/lib/qr/token.ts)", () => {
  beforeEach(() => {
    vi.stubEnv("QR_SIGNING_SECRET", "secreto-de-prueba-solo-tests");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("un token recién firmado verifica y devuelve el payload original", () => {
    const token = firmarToken(PAYLOAD);
    const resultado = verificarToken(token);

    expect(resultado.valido).toBe(true);
    expect(resultado.payload).toEqual(PAYLOAD);
  });

  it("un token alterado (un byte cambiado) se rechaza", () => {
    const token = firmarToken(PAYLOAD);

    // Alterar cada posición del token, un byte a la vez: TODAS deben fallar.
    for (let i = 0; i < token.length; i++) {
      const original = token[i];
      const sustituto = original === "A" ? "B" : "A";
      if (original === "." || original === sustituto) continue;
      const alterado = token.slice(0, i) + sustituto + token.slice(i + 1);
      expect(verificarToken(alterado).valido).toBe(false);
      expect(verificarToken(alterado).payload).toBeNull();
    }
  });

  it("un token firmado con otro secreto se rechaza", () => {
    const token = firmarToken(PAYLOAD);
    vi.stubEnv("QR_SIGNING_SECRET", "otro-secreto-distinto");
    expect(verificarToken(token).valido).toBe(false);
  });

  it("basura sin formato token se rechaza sin lanzar", () => {
    expect(verificarToken("").valido).toBe(false);
    expect(verificarToken("sin-punto").valido).toBe(false);
    expect(verificarToken("a.b.c").valido).toBe(false);
    expect(verificarToken("..").valido).toBe(false);
  });

  it("el hash guardado en BD no permite reconstruir ni usar el token", () => {
    const token = firmarToken(PAYLOAD);
    const hash = hashParaBD(token);

    // Es un SHA-256 hex (una vía): 64 caracteres, distinto del token.
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(token);
    expect(token).not.toContain(hash);
    expect(hash).toBe(createHash("sha256").update(token).digest("hex"));

    // El hash NO es un token válido: presentarlo en el check-in se rechaza.
    expect(verificarToken(hash).valido).toBe(false);

    // Determinista: el check-in puede buscar por hash el registro correcto.
    expect(hashParaBD(token)).toBe(hash);
  });

  it("firmarToken lanza si QR_SIGNING_SECRET no está definido", () => {
    vi.stubEnv("QR_SIGNING_SECRET", "");
    expect(() => firmarToken(PAYLOAD)).toThrow(/QR_SIGNING_SECRET/);
  });
});
