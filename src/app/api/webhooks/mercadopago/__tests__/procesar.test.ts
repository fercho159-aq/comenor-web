import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  procesarPago,
  type DependenciasWebhook,
  type PagoConsultado,
  type RegistroConEvento,
} from "../procesar";

// firmarToken/hashParaBD leen QR_SIGNING_SECRET en tiempo de llamada.
beforeEach(() => {
  process.env.QR_SIGNING_SECRET = "secreto-de-prueba-para-tests-unitarios";
});

const REGISTRATION_ID = "11111111-1111-4111-8111-111111111111";
const EVENT_ID = "22222222-2222-4222-8222-222222222222";
const PAYMENT_ID = "1234567890";
const COSTO = 150000; // $1,500.00 MXN

function registroBase(
  overrides?: Partial<RegistroConEvento["registro"]>,
): RegistroConEvento {
  return {
    registro: {
      id: REGISTRATION_ID,
      nombre: "María Fernanda López",
      correo: "maria@example.com",
      estadoPago: "pendiente",
      mpPaymentId: null,
      ...overrides,
    },
    evento: {
      id: EVENT_ID,
      nombre: "Foro IC 2026",
      fecha: new Date("2026-09-24T17:00:00.000Z"),
      sede: "Centro Citibanamex",
      modalidad: "presencial",
      costoCentavos: COSTO,
      slug: "foro-ic-2026",
    },
  };
}

function pagoBase(overrides?: Partial<PagoConsultado>): PagoConsultado {
  return {
    id: PAYMENT_ID,
    estado: "approved",
    montoCentavos: COSTO,
    moneda: "MXN",
    externalReference: REGISTRATION_ID,
    ...overrides,
  };
}

function crearDeps(config: {
  pago: PagoConsultado;
  registro: RegistroConEvento | null;
  filasAprobado?: number;
  filasRechazado?: number;
}): {
  deps: DependenciasWebhook;
  mocks: {
    consultarPago: ReturnType<typeof vi.fn>;
    obtenerRegistroConEvento: ReturnType<typeof vi.fn>;
    marcarAprobado: ReturnType<typeof vi.fn>;
    marcarRechazado: ReturnType<typeof vi.fn>;
    registrarBitacora: ReturnType<typeof vi.fn>;
    enviarConfirmacion: ReturnType<typeof vi.fn>;
  };
} {
  const consultarPago = vi.fn().mockResolvedValue(config.pago);
  const obtenerRegistroConEvento = vi
    .fn()
    .mockResolvedValue(config.registro);
  const marcarAprobado = vi
    .fn()
    .mockResolvedValue(config.filasAprobado ?? 1);
  const marcarRechazado = vi
    .fn()
    .mockResolvedValue(config.filasRechazado ?? 1);
  const registrarBitacora = vi.fn().mockResolvedValue(undefined);
  const enviarConfirmacion = vi.fn().mockResolvedValue(undefined);

  return {
    deps: {
      consultarPago,
      repo: {
        obtenerRegistroConEvento,
        marcarAprobado,
        marcarRechazado,
        registrarBitacora,
      },
      enviarConfirmacion,
    },
    mocks: {
      consultarPago,
      obtenerRegistroConEvento,
      marcarAprobado,
      marcarRechazado,
      registrarBitacora,
      enviarConfirmacion,
    },
  };
}

describe("procesarPago", () => {
  it("aprueba, marca el registro, firma el QR y envía UN correo cuando el monto coincide", async () => {
    const { deps, mocks } = crearDeps({
      pago: pagoBase(),
      registro: registroBase(),
    });

    const resultado = await procesarPago(PAYMENT_ID, "payment.updated", deps, {});

    expect(resultado).toEqual({ estado: "aprobado", registrationId: REGISTRATION_ID });
    expect(mocks.marcarAprobado).toHaveBeenCalledTimes(1);
    // El QR se persiste como hash (nunca el token en claro).
    const argsAprobado = mocks.marcarAprobado.mock.calls[0][0];
    expect(argsAprobado.paymentId).toBe(PAYMENT_ID);
    expect(typeof argsAprobado.qrTokenHash).toBe("string");
    expect(argsAprobado.qrTokenHash).toMatch(/^[0-9a-f]{64}$/); // sha-256 hex
    expect(mocks.enviarConfirmacion).toHaveBeenCalledTimes(1);
    expect(mocks.marcarRechazado).not.toHaveBeenCalled();
  });

  it("NO reprocesa un webhook approved duplicado: el UPDATE condicional afecta 0 filas y no reenvía QR/correo", async () => {
    // Idempotencia real: la notificación llega otra vez, pero el registro ya
    // está aprobado, así que marcarAprobado (WHERE estado<>'aprobado') afecta 0
    // filas => duplicado. No hay pre-check por estado que oculte una reversión.
    const { deps, mocks } = crearDeps({
      pago: pagoBase(),
      registro: registroBase({ estadoPago: "aprobado", mpPaymentId: PAYMENT_ID }),
      filasAprobado: 0,
    });

    const resultado = await procesarPago(PAYMENT_ID, "payment.updated", deps, {});

    expect(resultado).toEqual({ estado: "duplicado" });
    expect(mocks.marcarAprobado).toHaveBeenCalledTimes(1);
    expect(mocks.enviarConfirmacion).not.toHaveBeenCalled();
  });

  it("un contracargo (charged_back) sobre un registro YA aprobado lo revierte a rechazado (invalidando el QR)", async () => {
    // Regresión de seguridad: la notificación de reembolso/contracargo llega con
    // el MISMO payment_id que la aprobación. El pre-check viejo la descartaba
    // como 'duplicado' y el QR seguía vivo. Ahora debe entrar a la rama de
    // rechazo y marcarRechazado (que anula qr_token_hash en el repositorio).
    const { deps, mocks } = crearDeps({
      pago: pagoBase({ estado: "charged_back" }),
      registro: registroBase({ estadoPago: "aprobado", mpPaymentId: PAYMENT_ID }),
      filasRechazado: 1,
    });

    const resultado = await procesarPago(PAYMENT_ID, "payment.updated", deps, {});

    expect(resultado).toEqual({ estado: "rechazado", registrationId: REGISTRATION_ID });
    expect(mocks.marcarRechazado).toHaveBeenCalledTimes(1);
    expect(mocks.marcarRechazado.mock.calls[0][0].registrationId).toBe(REGISTRATION_ID);
    expect(mocks.marcarAprobado).not.toHaveBeenCalled();
    expect(mocks.enviarConfirmacion).not.toHaveBeenCalled();
  });

  it("un contracargo repetido (ya rechazado) afecta 0 filas y se reporta duplicado", async () => {
    const { deps, mocks } = crearDeps({
      pago: pagoBase({ estado: "refunded" }),
      registro: registroBase({ estadoPago: "rechazado", mpPaymentId: PAYMENT_ID }),
      filasRechazado: 0,
    });

    const resultado = await procesarPago(PAYMENT_ID, "payment.updated", deps, {});

    expect(resultado).toEqual({ estado: "duplicado" });
    expect(mocks.marcarRechazado).toHaveBeenCalledTimes(1);
  });

  it("trata como duplicado la carrera donde el UPDATE condicional no afecta filas (0 filas)", async () => {
    const { deps, mocks } = crearDeps({
      pago: pagoBase(),
      registro: registroBase(),
      filasAprobado: 0,
    });

    const resultado = await procesarPago(PAYMENT_ID, "payment.updated", deps, {});

    expect(resultado).toEqual({ estado: "duplicado" });
    expect(mocks.marcarAprobado).toHaveBeenCalledTimes(1);
    expect(mocks.enviarConfirmacion).not.toHaveBeenCalled();
  });

  it("NO aprueba si el monto real de MP no coincide con el costo del evento", async () => {
    const { deps, mocks } = crearDeps({
      pago: pagoBase({ montoCentavos: 100 }), // $1.00 en vez de $1,500
      registro: registroBase(),
    });

    const resultado = await procesarPago(PAYMENT_ID, "payment.updated", deps, {});

    expect(resultado).toEqual({
      estado: "monto_invalido",
      esperadoCentavos: COSTO,
      recibidoCentavos: 100,
    });
    expect(mocks.marcarAprobado).not.toHaveBeenCalled();
    expect(mocks.enviarConfirmacion).not.toHaveBeenCalled();
  });

  it("NO aprueba si la moneda no es MXN aunque el monto numérico coincida", async () => {
    const { deps, mocks } = crearDeps({
      pago: pagoBase({ moneda: "USD" }),
      registro: registroBase(),
    });

    const resultado = await procesarPago(PAYMENT_ID, "payment.updated", deps, {});

    expect(resultado.estado).toBe("monto_invalido");
    expect(mocks.marcarAprobado).not.toHaveBeenCalled();
    expect(mocks.enviarConfirmacion).not.toHaveBeenCalled();
  });

  it("marca rechazado sin QR ni correo cuando el pago viene rechazado", async () => {
    const { deps, mocks } = crearDeps({
      pago: pagoBase({ estado: "rejected" }),
      registro: registroBase(),
    });

    const resultado = await procesarPago(PAYMENT_ID, "payment.updated", deps, {});

    expect(resultado).toEqual({ estado: "rechazado", registrationId: REGISTRATION_ID });
    expect(mocks.marcarRechazado).toHaveBeenCalledTimes(1);
    expect(mocks.enviarConfirmacion).not.toHaveBeenCalled();
    expect(mocks.marcarAprobado).not.toHaveBeenCalled();
  });

  it("ignora pagos sin external_reference (no se puede ligar a un registro)", async () => {
    const { deps, mocks } = crearDeps({
      pago: pagoBase({ externalReference: null }),
      registro: registroBase(),
    });

    const resultado = await procesarPago(PAYMENT_ID, "payment.updated", deps, {});

    expect(resultado.estado).toBe("ignorado");
    expect(mocks.obtenerRegistroConEvento).not.toHaveBeenCalled();
  });

  it("ignora estados no terminales (pending/in_process) sin cambiar el registro", async () => {
    const { deps, mocks } = crearDeps({
      pago: pagoBase({ estado: "in_process" }),
      registro: registroBase(),
    });

    const resultado = await procesarPago(PAYMENT_ID, "payment.updated", deps, {});

    expect(resultado.estado).toBe("ignorado");
    expect(mocks.marcarAprobado).not.toHaveBeenCalled();
    expect(mocks.marcarRechazado).not.toHaveBeenCalled();
    expect(mocks.enviarConfirmacion).not.toHaveBeenCalled();
  });
});
