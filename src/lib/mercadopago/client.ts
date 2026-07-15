/**
 * Wrapper del SDK oficial de Mercado Pago (Checkout Pro) — PLAN.md §2.3.
 *
 * Reglas duras:
 * - Todo pasa por `MP_ACCESS_TOKEN` / `MP_WEBHOOK_SECRET` de process.env. Cero llaves en código.
 * - Modo sandbox por env: un access token de prueba (prefijo `TEST-`) hace que
 *   `crearPreferencia` devuelva el `sandbox_init_point`; credenciales productivas
 *   devuelven el `init_point` real. Staging usa credenciales sandbox (PLAN §1.3).
 * - NUNCA confiar en el monto que manda el cliente: el webhook debe llamar
 *   `consultarPago(paymentId)` y comparar el monto contra `events.costo_centavos`.
 * - La idempotencia por `mp_payment_id` (tabla payments_log + índice único en
 *   registrations.mp_payment_id) es responsabilidad del route handler del webhook.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

function obtenerAccessToken(): string {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "MP_ACCESS_TOKEN no está definido. Configúralo en .env.local (ver .env.example).",
    );
  }
  return token;
}

/** true si las credenciales configuradas son de sandbox (prefijo TEST-). */
export function esModoSandbox(): boolean {
  return obtenerAccessToken().startsWith("TEST-");
}

function crearCliente(): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken: obtenerAccessToken() });
}

// ---------------------------------------------------------------------------
// Preferencias (Checkout Pro)
// ---------------------------------------------------------------------------

/** Datos mínimos de un registro para generar su preferencia de pago. */
export interface RegistroParaPago {
  /** UUID del registro (registrations.id) — viaja como external_reference. */
  registrationId: string;
  /** Nombre del evento; aparece como concepto en el checkout. */
  tituloEvento: string;
  /** Costo en centavos MXN (events.costo_centavos). Debe ser > 0. */
  costoCentavos: number;
  /** Correo del asistente (registrations.correo). */
  correo: string;
  /** Nombre del asistente (registrations.nombre). */
  nombre: string;
  /** URL absoluta a la que vuelve el usuario si el pago se aprueba. */
  urlExito: string;
  /** URL absoluta si el pago falla. Default: urlExito. */
  urlError?: string;
  /** URL absoluta si el pago queda pendiente. Default: urlExito. */
  urlPendiente?: string;
  /** URL absoluta del route handler del webhook (notification_url). */
  urlWebhook?: string;
}

/** Resultado de crear una preferencia de Checkout Pro. */
export interface PreferenciaCreada {
  preferenceId: string;
  /** URL a la que se redirige al usuario (sandbox_init_point en modo sandbox). */
  initPoint: string;
}

/**
 * Crea una preferencia de Checkout Pro para un registro de evento de pago.
 * El monto sale SIEMPRE de la BD (costoCentavos), jamás del cliente.
 */
export async function crearPreferencia(
  registro: RegistroParaPago,
): Promise<PreferenciaCreada> {
  if (!Number.isInteger(registro.costoCentavos) || registro.costoCentavos <= 0) {
    throw new Error(
      "crearPreferencia requiere costoCentavos entero > 0; los eventos gratuitos no pasan por Mercado Pago.",
    );
  }

  const preference = new Preference(crearCliente());
  const respuesta = await preference.create({
    body: {
      items: [
        {
          id: registro.registrationId,
          title: registro.tituloEvento,
          quantity: 1,
          unit_price: registro.costoCentavos / 100,
          currency_id: "MXN",
        },
      ],
      payer: {
        name: registro.nombre,
        email: registro.correo,
      },
      external_reference: registro.registrationId,
      back_urls: {
        success: registro.urlExito,
        failure: registro.urlError ?? registro.urlExito,
        pending: registro.urlPendiente ?? registro.urlExito,
      },
      auto_return: "approved",
      ...(registro.urlWebhook ? { notification_url: registro.urlWebhook } : {}),
    },
  });

  const initPoint = esModoSandbox()
    ? (respuesta.sandbox_init_point ?? respuesta.init_point)
    : respuesta.init_point;

  if (!respuesta.id || !initPoint) {
    throw new Error("Mercado Pago no devolvió preference_id / init_point.");
  }

  return { preferenceId: String(respuesta.id), initPoint };
}

// ---------------------------------------------------------------------------
// Verificación de firma de webhooks (x-signature)
// ---------------------------------------------------------------------------

/** Headers aceptados: el objeto Headers del Request o un record plano. */
export type HeadersEntrantes =
  | Headers
  | Readonly<Record<string, string | string[] | undefined>>;

/** Resultado de la validación de firma. */
export type ResultadoFirma =
  | { valida: true }
  | { valida: false; motivo: string };

function leerHeader(headers: HeadersEntrantes, nombre: string): string | null {
  if (typeof (headers as Headers).get === "function") {
    return (headers as Headers).get(nombre);
  }
  const record = headers as Readonly<
    Record<string, string | string[] | undefined>
  >;
  const valor = record[nombre] ?? record[nombre.toLowerCase()];
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

/**
 * Valida la firma `x-signature` de un webhook de Mercado Pago con
 * `MP_WEBHOOK_SECRET` (PLAN §2.3).
 *
 * Mercado Pago NO firma el body: firma el manifiesto
 * `id:{data.id};request-id:{x-request-id};ts:{ts};` con HMAC-SHA256.
 * Por eso el segundo argumento es `dataId` — el parámetro `data.id` que llega
 * en el query string de la notificación (?data.id=...), en minúsculas si es
 * alfanumérico, tal como exige la documentación oficial.
 *
 * Incluye protección anti-replay: rechaza firmas con `ts` fuera de la
 * tolerancia (default 300 s). Comparación en tiempo constante.
 */
export function verificarFirmaWebhook(
  headers: HeadersEntrantes,
  dataId: string,
  opciones: { toleranciaSegundos?: number; ahoraMs?: number } = {},
): ResultadoFirma {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    return { valida: false, motivo: "MP_WEBHOOK_SECRET no está definido." };
  }

  const xSignature = leerHeader(headers, "x-signature");
  if (!xSignature) {
    return { valida: false, motivo: "Falta el header x-signature." };
  }

  // x-signature = "ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839"
  let ts: string | undefined;
  let v1: string | undefined;
  for (const parte of xSignature.split(",")) {
    const [clave, valor] = parte.split("=", 2).map((s) => s?.trim());
    if (clave === "ts") ts = valor;
    if (clave === "v1") v1 = valor;
  }
  if (!ts || !v1) {
    return { valida: false, motivo: "x-signature sin ts o v1." };
  }

  const toleranciaSegundos = opciones.toleranciaSegundos ?? 300;
  if (toleranciaSegundos > 0) {
    const ahoraSegundos = Math.floor((opciones.ahoraMs ?? Date.now()) / 1000);
    // MP manda ts en milisegundos; normalizamos ambos casos por robustez.
    const tsNumero = Number(ts);
    if (!Number.isFinite(tsNumero)) {
      return { valida: false, motivo: "ts de x-signature no es numérico." };
    }
    const tsSegundos = tsNumero > 1e12 ? Math.floor(tsNumero / 1000) : tsNumero;
    if (Math.abs(ahoraSegundos - tsSegundos) > toleranciaSegundos) {
      return { valida: false, motivo: "Firma expirada (posible replay)." };
    }
  }

  const xRequestId = leerHeader(headers, "x-request-id");

  // Manifiesto oficial: se omite cada sección cuyo valor no venga.
  let manifiesto = "";
  if (dataId) manifiesto += `id:${dataId.toLowerCase()};`;
  if (xRequestId) manifiesto += `request-id:${xRequestId};`;
  manifiesto += `ts:${ts};`;

  const esperada = createHmac("sha256", secreto)
    .update(manifiesto)
    .digest("hex");

  const bufEsperada = Buffer.from(esperada, "utf8");
  const bufRecibida = Buffer.from(v1, "utf8");
  if (
    bufEsperada.length !== bufRecibida.length ||
    !timingSafeEqual(bufEsperada, bufRecibida)
  ) {
    return { valida: false, motivo: "La firma v1 no coincide." };
  }

  return { valida: true };
}

// ---------------------------------------------------------------------------
// Consulta de pagos (fuente de verdad del monto)
// ---------------------------------------------------------------------------

/** Pago consultado directamente a la API de Mercado Pago. */
export interface PagoConsultado {
  id: string;
  /** approved | pending | rejected | cancelled | refunded | charged_back | in_process */
  estado: string;
  /** Monto REAL cobrado, en centavos MXN — comparar contra events.costo_centavos. */
  montoCentavos: number;
  moneda: string;
  /** external_reference = registrations.id que mandamos al crear la preferencia. */
  externalReference: string | null;
}

/**
 * Consulta un pago DIRECTO en la API de Mercado Pago.
 * El webhook y cualquier confirmación deben usar esto como única fuente de
 * verdad de estado y monto — nunca el payload que manda el cliente o el body
 * de la notificación.
 */
export async function consultarPago(paymentId: string): Promise<PagoConsultado> {
  const payment = new Payment(crearCliente());
  const respuesta = await payment.get({ id: paymentId });

  if (respuesta.id === undefined || respuesta.id === null) {
    throw new Error(`Mercado Pago no encontró el pago ${paymentId}.`);
  }

  return {
    id: String(respuesta.id),
    estado: respuesta.status ?? "unknown",
    montoCentavos: Math.round((respuesta.transaction_amount ?? 0) * 100),
    moneda: respuesta.currency_id ?? "MXN",
    externalReference: respuesta.external_reference ?? null,
  };
}
