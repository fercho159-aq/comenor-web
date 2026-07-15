import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { verificarFirmaWebhook } from "@/lib/mercadopago/client";

import { POST } from "../route";
import { procesarPago } from "../procesar";

// Aislamos el route handler de la BD, MP y la lógica de negocio.
vi.mock("@/lib/mercadopago/client", () => ({
  verificarFirmaWebhook: vi.fn(),
}));
vi.mock("../procesar", () => ({
  procesarPago: vi.fn(),
}));
vi.mock("../repositorio", () => ({
  crearDependenciasWebhook: vi.fn(() => ({})),
}));

const verificarFirma = verificarFirmaWebhook as unknown as Mock;
const procesar = procesarPago as unknown as Mock;

const URL_BASE = "https://comenor.org.mx/api/webhooks/mercadopago";

function peticion(opciones: {
  query?: string;
  body?: unknown;
  bodyCrudo?: string;
}): Request {
  const url = opciones.query ? `${URL_BASE}?${opciones.query}` : URL_BASE;
  const body =
    opciones.bodyCrudo ??
    (opciones.body !== undefined ? JSON.stringify(opciones.body) : "");
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  verificarFirma.mockReturnValue({ valida: true });
  procesar.mockResolvedValue({ estado: "aprobado", registrationId: "reg-1" });
});

describe("POST /api/webhooks/mercadopago", () => {
  it("responde 401 y NO procesa cuando la firma es inválida", async () => {
    verificarFirma.mockReturnValue({ valida: false, motivo: "firma no coincide" });

    const res = await POST(
      peticion({
        query: "data.id=1234567890&type=payment",
        body: { type: "payment", data: { id: "1234567890" } },
      }),
    );

    expect(res.status).toBe(401);
    expect(procesar).not.toHaveBeenCalled();
  });

  it("responde 400 con error por campo cuando falta data.id", async () => {
    const res = await POST(
      peticion({ query: "type=payment", body: { type: "payment" } }),
    );

    expect(res.status).toBe(400);
    const json = (await res.json()) as { errores: Record<string, string[]> };
    expect(json.errores["data.id"]).toBeDefined();
    expect(verificarFirma).not.toHaveBeenCalled();
    expect(procesar).not.toHaveBeenCalled();
  });

  it("responde 400 cuando el body no es JSON válido", async () => {
    const res = await POST(
      peticion({ query: "data.id=1&type=payment", bodyCrudo: "{no-json" }),
    );

    expect(res.status).toBe(400);
    expect(procesar).not.toHaveBeenCalled();
  });

  it("procesa el pago y responde 200 con firma válida y tipo payment", async () => {
    const res = await POST(
      peticion({
        query: "data.id=1234567890&type=payment",
        body: { type: "payment", action: "payment.updated", data: { id: "1234567890" } },
      }),
    );

    expect(res.status).toBe(200);
    expect(procesar).toHaveBeenCalledTimes(1);
    // Primer argumento: el paymentId resuelto del query string.
    expect(procesar.mock.calls[0][0]).toBe("1234567890");
    expect(procesar.mock.calls[0][1]).toBe("payment.updated");
  });

  it("ignora (200) notificaciones que no son de tipo payment sin procesar", async () => {
    const res = await POST(
      peticion({
        query: "data.id=99&type=merchant_order",
        body: { type: "merchant_order", data: { id: "99" } },
      }),
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { estado: string };
    expect(json.estado).toBe("ignorado");
    expect(procesar).not.toHaveBeenCalled();
  });

  it("toma el data.id del body cuando no viene en el query string", async () => {
    const res = await POST(
      peticion({
        query: "type=payment",
        body: { type: "payment", data: { id: "5555" } },
      }),
    );

    expect(res.status).toBe(200);
    expect(procesar.mock.calls[0][0]).toBe("5555");
  });
});
