import { createHmac } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verificarFirmaWebhook } from "@/lib/mercadopago/client";

const SECRETO = "mp-webhook-secret-de-prueba";
const DATA_ID = "12345678901";
const REQUEST_ID = "req-abc-123";

/** Construye headers con una firma calculada igual que Mercado Pago. */
function firmarComoMercadoPago(
  dataId: string,
  ts: number,
  secreto: string = SECRETO,
  requestId: string = REQUEST_ID,
): Record<string, string> {
  const manifiesto = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac("sha256", secreto).update(manifiesto).digest("hex");
  return {
    "x-signature": `ts=${ts},v1=${v1}`,
    "x-request-id": requestId,
  };
}

describe("verificarFirmaWebhook (Mercado Pago x-signature)", () => {
  const AHORA_MS = 1_770_000_000_000;
  let tsValido: number;

  beforeEach(() => {
    vi.stubEnv("MP_WEBHOOK_SECRET", SECRETO);
    tsValido = Math.floor(AHORA_MS / 1000);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("una firma válida pasa", () => {
    const headers = firmarComoMercadoPago(DATA_ID, tsValido);
    const resultado = verificarFirmaWebhook(headers, DATA_ID, {
      ahoraMs: AHORA_MS,
    });
    expect(resultado.valida).toBe(true);
  });

  it("acepta el objeto Headers estándar de un Request", () => {
    const headers = new Headers(firmarComoMercadoPago(DATA_ID, tsValido));
    expect(
      verificarFirmaWebhook(headers, DATA_ID, { ahoraMs: AHORA_MS }).valida,
    ).toBe(true);
  });

  it("una firma calculada con OTRO secreto se rechaza", () => {
    const headers = firmarComoMercadoPago(DATA_ID, tsValido, "secreto-equivocado");
    const resultado = verificarFirmaWebhook(headers, DATA_ID, {
      ahoraMs: AHORA_MS,
    });
    expect(resultado.valida).toBe(false);
  });

  it("una firma válida pero con data.id distinto se rechaza (no se puede reusar para otro pago)", () => {
    const headers = firmarComoMercadoPago(DATA_ID, tsValido);
    const resultado = verificarFirmaWebhook(headers, "99999999999", {
      ahoraMs: AHORA_MS,
    });
    expect(resultado.valida).toBe(false);
  });

  it("una firma alterada (v1 manipulado) se rechaza", () => {
    const headers = firmarComoMercadoPago(DATA_ID, tsValido);
    const original = headers["x-signature"];
    headers["x-signature"] = original.endsWith("0")
      ? original.slice(0, -1) + "1"
      : original.slice(0, -1) + "0";
    expect(
      verificarFirmaWebhook(headers, DATA_ID, { ahoraMs: AHORA_MS }).valida,
    ).toBe(false);
  });

  it("sin header x-signature se rechaza", () => {
    const resultado = verificarFirmaWebhook(
      { "x-request-id": REQUEST_ID },
      DATA_ID,
      { ahoraMs: AHORA_MS },
    );
    expect(resultado.valida).toBe(false);
    if (!resultado.valida) {
      expect(resultado.motivo).toMatch(/x-signature/);
    }
  });

  it("una firma con ts fuera de tolerancia se rechaza (anti-replay)", () => {
    const tsViejo = tsValido - 3600; // una hora atrás
    const headers = firmarComoMercadoPago(DATA_ID, tsViejo);
    const resultado = verificarFirmaWebhook(headers, DATA_ID, {
      ahoraMs: AHORA_MS,
      toleranciaSegundos: 300,
    });
    expect(resultado.valida).toBe(false);
  });

  it("sin MP_WEBHOOK_SECRET en env se rechaza en vez de aceptar todo", () => {
    vi.stubEnv("MP_WEBHOOK_SECRET", "");
    const headers = firmarComoMercadoPago(DATA_ID, tsValido);
    expect(
      verificarFirmaWebhook(headers, DATA_ID, { ahoraMs: AHORA_MS }).valida,
    ).toBe(false);
  });

  it("el data.id alfanumérico se normaliza a minúsculas como exige MP", () => {
    const dataIdMayusculas = "ABC123XYZ";
    // MP firma con el id en minúsculas.
    const headers = firmarComoMercadoPago(dataIdMayusculas.toLowerCase(), tsValido);
    expect(
      verificarFirmaWebhook(headers, dataIdMayusculas, { ahoraMs: AHORA_MS })
        .valida,
    ).toBe(true);
  });
});
