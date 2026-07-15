import { beforeEach, describe, expect, it, vi } from "vitest";

const { enviarCorreo } = vi.hoisted(() => ({ enviarCorreo: vi.fn() }));
vi.mock("@/lib/email/resend", () => ({ enviarCorreo }));

// Rate limiter mockeado: por defecto PERMITE, para que las pruebas de
// validación/envío no compartan cubeta en memoria. `esHoneypotDisparado` y
// `CAMPO_HONEYPOT` se mantienen reales (importActual).
const { limitar } = vi.hoisted(() => ({
  limitar: vi.fn(async () => ({ permitido: true, restantes: 99 })),
}));
vi.mock("@/lib/ratelimit", async (importActual) => {
  const real = await importActual<typeof import("@/lib/ratelimit")>();
  return { ...real, limitar };
});

import { POST } from "@/app/api/contacto/route";

function peticion(body: unknown): Request {
  return new Request("http://localhost/api/contacto", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const valido = {
  nombre: "María López",
  correo: "maria@ejemplo.mx",
  telefono: "5512345678",
  asunto: "Solicitud de información",
  mensaje: "Me interesa conocer los requisitos de afiliación. Gracias.",
};

describe("POST /api/contacto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enviarCorreo.mockResolvedValue({ simulado: true });
    limitar.mockResolvedValue({ permitido: true, restantes: 99 });
  });

  it("valida y envía el correo con replyTo al remitente (200)", async () => {
    const res = await POST(peticion(valido));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.mensaje).toMatch(/Gracias/);
    expect(enviarCorreo).toHaveBeenCalledTimes(1);
    expect(enviarCorreo).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "direccioncomenor@comenor.org.mx",
        replyTo: "maria@ejemplo.mx",
        subject: "Contacto: Solicitud de información",
      }),
    );
  });

  it("re-valida en el servidor: campo vacío ⇒ 400 con error por campo", async () => {
    const res = await POST(peticion({ ...valido, mensaje: "" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.errores.mensaje).toBeDefined();
    expect(enviarCorreo).not.toHaveBeenCalled();
  });

  it("responde 502 si el envío falla (Resend lanza)", async () => {
    enviarCorreo.mockRejectedValue(new Error("Resend caído"));

    const res = await POST(peticion(valido));
    expect(res.status).toBe(502);
  });

  it("responde 400 si el cuerpo no es JSON válido", async () => {
    const req = new Request("http://localhost/api/contacto", {
      method: "POST",
      body: "no-es-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(enviarCorreo).not.toHaveBeenCalled();
  });

  it("rate limit superado ⇒ 429 sin enviar correo (anti mail bombing)", async () => {
    limitar.mockResolvedValue({ permitido: false, restantes: 0 });

    const res = await POST(peticion(valido));
    expect(res.status).toBe(429);
    expect(enviarCorreo).not.toHaveBeenCalled();
  });

  it("honeypot relleno ⇒ 200 genérico SIN enviar correo", async () => {
    const res = await POST(peticion({ ...valido, sitio_web: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(enviarCorreo).not.toHaveBeenCalled();
  });
});
