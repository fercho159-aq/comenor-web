import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Event, Registration } from "@/db/schema";

// --- Mocks de servicios externos y capa de datos --------------------------
// El esquema Zod (@/lib/schemas) se deja REAL: probamos la validación doble.

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,QQ=="),
  },
}));

vi.mock("@/emails", () => ({
  asuntos: {
    confirmacionRegistro: (n: string) => `Registro confirmado: ${n}`,
  },
  ConfirmacionRegistro: () => null,
}));

vi.mock("@/lib/email/resend", () => ({
  enviarCorreo: vi.fn().mockResolvedValue({ simulado: true }),
}));

vi.mock("@/lib/mercadopago/client", () => ({
  crearPreferencia: vi.fn(),
}));

vi.mock("@/lib/qr/token", () => ({
  firmarToken: vi.fn(() => "TOKEN.FIRMA"),
  hashParaBD: vi.fn(() => "HASH_QR"),
}));

vi.mock("@/lib/ratelimit", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/ratelimit")>();
  return {
    ...real,
    limitar: vi
      .fn()
      .mockResolvedValue({ permitido: true, restantes: 4, reiniciaEnMs: 60_000 }),
  };
});

vi.mock("@/app/api/eventos/_datos", () => ({
  buscarEventoPorSlug: vi.fn(),
  contarRegistrosActivos: vi.fn(),
  crearRegistro: vi.fn(),
  guardarHashQr: vi.fn(),
}));

// --- Imports (después de los mocks) ---------------------------------------

import { POST } from "@/app/api/eventos/[slug]/registro/route";
import {
  buscarEventoPorSlug,
  contarRegistrosActivos,
  crearRegistro,
  guardarHashQr,
} from "@/app/api/eventos/_datos";
import { enviarCorreo } from "@/lib/email/resend";
import { crearPreferencia } from "@/lib/mercadopago/client";
import { hashParaBD } from "@/lib/qr/token";
import { limitar } from "@/lib/ratelimit";

// --- Fixtures --------------------------------------------------------------

const BODY_VALIDO = {
  nombre: "Ana López",
  cargo: "Directora de Calidad",
  correo: "ana@example.com",
  celular: "5512345678",
  organismo: "Certificaciones Acme S.A.",
  solicitante: "Ana López",
};

function hacerEvento(overrides: Partial<Event> = {}): Event {
  return {
    id: "ev-1",
    nombre: "Foro de Infraestructura de la Calidad 2026",
    slug: "foro-ic-2026",
    fecha: new Date("2026-09-24T17:00:00.000Z"),
    sede: "Centro Citibanamex, CDMX",
    modalidad: "presencial",
    costoCentavos: 0,
    cupo: null,
    estado: "programado",
    descripcion: "Un foro sobre la infraestructura de la calidad en México.",
    imagenPath: null,
    publicado: true,
    registroAbierto: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function hacerRegistro(overrides: Partial<Registration> = {}): Registration {
  return {
    id: "reg-1",
    eventId: "ev-1",
    nombre: BODY_VALIDO.nombre,
    cargo: BODY_VALIDO.cargo,
    correo: BODY_VALIDO.correo,
    celular: BODY_VALIDO.celular,
    organismo: BODY_VALIDO.organismo,
    solicitante: BODY_VALIDO.solicitante,
    estadoPago: "gratuito",
    mpPaymentId: null,
    qrTokenHash: null,
    checkedInAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function llamar(body: unknown, slug = "foro-ic-2026") {
  const request = new Request(
    `http://localhost/api/eventos/${slug}/registro`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  return POST(request, { params: Promise.resolve({ slug }) });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(limitar).mockResolvedValue({
    permitido: true,
    restantes: 4,
    reiniciaEnMs: 60_000,
  });
});

// --- Pruebas ---------------------------------------------------------------

describe("POST /api/eventos/[slug]/registro", () => {
  it("400: re-valida con Zod y devuelve error por campo cuando falta uno", async () => {
    const sinCorreo = {
      nombre: BODY_VALIDO.nombre,
      cargo: BODY_VALIDO.cargo,
      celular: BODY_VALIDO.celular,
      organismo: BODY_VALIDO.organismo,
      solicitante: BODY_VALIDO.solicitante,
    };
    const res = await llamar(sinCorreo);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.errores?.correo?.[0]).toBeTruthy();
    // No debe tocar la base de datos si la validación falla.
    expect(buscarEventoPorSlug).not.toHaveBeenCalled();
    expect(crearRegistro).not.toHaveBeenCalled();
  });

  it("400: celular con formato inválido se rechaza por campo", async () => {
    const res = await llamar({ ...BODY_VALIDO, celular: "123" });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.errores?.celular?.[0]).toBeTruthy();
    expect(crearRegistro).not.toHaveBeenCalled();
  });

  it("409: rechaza el registro cuando el cupo está lleno", async () => {
    vi.mocked(buscarEventoPorSlug).mockResolvedValue(
      hacerEvento({ costoCentavos: 0, cupo: 2 }),
    );
    vi.mocked(contarRegistrosActivos).mockResolvedValue(2);

    const res = await llamar(BODY_VALIDO);
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.mensaje).toMatch(/cupo lleno/i);
    expect(crearRegistro).not.toHaveBeenCalled();
    expect(crearPreferencia).not.toHaveBeenCalled();
  });

  it("201: evento gratuito genera el hash del QR y NO toca Mercado Pago", async () => {
    vi.mocked(buscarEventoPorSlug).mockResolvedValue(
      hacerEvento({ costoCentavos: 0, cupo: null }),
    );
    vi.mocked(crearRegistro).mockResolvedValue(
      hacerRegistro({ estadoPago: "gratuito" }),
    );

    const res = await llamar(BODY_VALIDO);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.estado).toBe("gratuito");
    expect(json.registrationId).toBe("reg-1");

    // Se creó como gratuito.
    expect(vi.mocked(crearRegistro).mock.calls[0]![0]).toMatchObject({
      eventId: "ev-1",
      estadoPago: "gratuito",
    });

    // QR: se guarda SOLO el hash, nunca el token.
    expect(hashParaBD).toHaveBeenCalledWith("TOKEN.FIRMA");
    expect(guardarHashQr).toHaveBeenCalledWith("reg-1", "HASH_QR");

    // Correo de confirmación encolado.
    expect(enviarCorreo).toHaveBeenCalledTimes(1);

    // Nunca pasa por Mercado Pago.
    expect(crearPreferencia).not.toHaveBeenCalled();
  });

  it("201: evento de pago crea preferencia y devuelve init_point, sin generar QR", async () => {
    vi.mocked(buscarEventoPorSlug).mockResolvedValue(
      hacerEvento({ costoCentavos: 150_000, cupo: null }),
    );
    vi.mocked(crearRegistro).mockResolvedValue(
      hacerRegistro({ estadoPago: "pendiente" }),
    );
    vi.mocked(crearPreferencia).mockResolvedValue({
      preferenceId: "pref-1",
      initPoint: "https://mp/checkout/pref-1",
    });

    const res = await llamar(BODY_VALIDO);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.estado).toBe("pendiente");
    expect(json.initPoint).toBe("https://mp/checkout/pref-1");

    // El monto sale de la BD, no del cliente.
    expect(vi.mocked(crearPreferencia).mock.calls[0]![0]).toMatchObject({
      registrationId: "reg-1",
      costoCentavos: 150_000,
    });

    // Registro pendiente, sin QR todavía (se genera al aprobar el pago).
    expect(vi.mocked(crearRegistro).mock.calls[0]![0]).toMatchObject({
      estadoPago: "pendiente",
    });
    expect(guardarHashQr).not.toHaveBeenCalled();
    expect(enviarCorreo).not.toHaveBeenCalled();
  });

  it("404: evento inexistente o no publicado", async () => {
    vi.mocked(buscarEventoPorSlug).mockResolvedValue(null);

    const res = await llamar(BODY_VALIDO);
    expect(res.status).toBe(404);
    expect(crearRegistro).not.toHaveBeenCalled();
  });

  it("409: registro cerrado cuando registroAbierto es false", async () => {
    vi.mocked(buscarEventoPorSlug).mockResolvedValue(
      hacerEvento({ registroAbierto: false }),
    );

    const res = await llamar(BODY_VALIDO);
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.mensaje).toMatch(/cerrado/i);
    expect(crearRegistro).not.toHaveBeenCalled();
  });

  it("200: honeypot lleno responde éxito silencioso sin persistir", async () => {
    const res = await llamar({ ...BODY_VALIDO, sitio_web: "http://spam.example" });

    expect(res.status).toBe(200);
    expect(buscarEventoPorSlug).not.toHaveBeenCalled();
    expect(crearRegistro).not.toHaveBeenCalled();
  });

  it("429: respeta el rate limit por IP", async () => {
    vi.mocked(limitar).mockResolvedValue({
      permitido: false,
      restantes: 0,
      reiniciaEnMs: 60_000,
    });

    const res = await llamar(BODY_VALIDO);
    expect(res.status).toBe(429);
    expect(buscarEventoPorSlug).not.toHaveBeenCalled();
  });

  it("400: cuerpo que no es JSON válido", async () => {
    const request = new Request(
      "http://localhost/api/eventos/foro-ic-2026/registro",
      { method: "POST", headers: { "content-type": "application/json" }, body: "no-json{" },
    );
    const res = await POST(request, {
      params: Promise.resolve({ slug: "foro-ic-2026" }),
    });
    expect(res.status).toBe(400);
  });

  it("502: si Mercado Pago falla, el registro pendiente queda y responde 502", async () => {
    vi.mocked(buscarEventoPorSlug).mockResolvedValue(
      hacerEvento({ costoCentavos: 150_000, cupo: null }),
    );
    vi.mocked(crearRegistro).mockResolvedValue(
      hacerRegistro({ estadoPago: "pendiente" }),
    );
    vi.mocked(crearPreferencia).mockRejectedValue(new Error("MP caído"));

    const res = await llamar(BODY_VALIDO);
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.registrationId).toBe("reg-1");
  });
});
