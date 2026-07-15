/**
 * POST /api/webhooks/mercadopago — recepción de notificaciones de pago (PLAN §2.3).
 *
 * Contrato:
 *  - Firma `x-signature` inválida ⇒ 401 (nunca se toca la BD).
 *  - Body no-JSON o `data.id` ausente ⇒ 400 con error por campo (validación doble Zod).
 *  - Notificación que no es de tipo `payment` ⇒ 200 (ignorada, sin trabajo).
 *  - Pago válido ⇒ se procesa y se responde 200 rápido. El monto y el estado se
 *    consultan a la API de MP (jamás se confían del body). Idempotencia por
 *    `mp_payment_id`: un pago repetido no genera segundo QR ni segundo correo.
 *  - Excepción inesperada (p. ej. MP caído) ⇒ 500 para que MP reintente.
 */
import { NextResponse } from "next/server";

import { verificarFirmaWebhook } from "@/lib/mercadopago/client";

import { procesarPago } from "./procesar";
import { crearDependenciasWebhook } from "./repositorio";
import { mercadoPagoWebhookSchema } from "./webhook-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Extrae el `data.id` del query string (formato oficial `?data.id=...`). */
function dataIdDeQuery(url: URL): string | null {
  return url.searchParams.get("data.id") ?? url.searchParams.get("id");
}

/** Tipo de notificación desde query (`type` o `topic`). */
function tipoDeQuery(url: URL): string | null {
  return url.searchParams.get("type") ?? url.searchParams.get("topic");
}

export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // 1. Body JSON (puede venir vacío si MP sólo manda el query string).
  const crudo = await request.text();
  let cuerpo: unknown = {};
  if (crudo.trim().length > 0) {
    try {
      cuerpo = JSON.parse(crudo);
    } catch {
      return NextResponse.json(
        { mensaje: "El cuerpo de la notificación no es JSON válido." },
        { status: 400 },
      );
    }
  }

  // 2. Validación doble Zod de la forma del body.
  const parseo = mercadoPagoWebhookSchema.safeParse(cuerpo);
  if (!parseo.success) {
    return NextResponse.json(
      {
        mensaje: "Notificación con formato inválido.",
        errores: parseo.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  const notificacion = parseo.data;

  // 3. Resolver el id del pago (query tiene prioridad; si no, el body).
  const dataIdCrudo =
    dataIdDeQuery(url) ??
    (notificacion.data?.id != null ? String(notificacion.data.id) : null);
  const dataId = dataIdCrudo?.trim();
  if (!dataId) {
    return NextResponse.json(
      {
        mensaje: "Falta el identificador del pago.",
        errores: { "data.id": ["El identificador del pago es obligatorio."] },
      },
      { status: 400 },
    );
  }

  // 4. Verificar la firma ANTES de tocar la BD. Inválida ⇒ 401.
  const firma = verificarFirmaWebhook(request.headers, dataId);
  if (!firma.valida) {
    return NextResponse.json(
      { mensaje: "Firma de webhook inválida." },
      { status: 401 },
    );
  }

  // 5. Sólo procesamos notificaciones de pago; el resto se ignoran (200).
  const tipo = tipoDeQuery(url) ?? notificacion.type ?? notificacion.topic;
  if (tipo !== "payment") {
    return NextResponse.json(
      { estado: "ignorado", motivo: `Tipo no manejado: ${tipo ?? "desconocido"}.` },
      { status: 200 },
    );
  }

  const mpEvent = notificacion.action ?? tipo;

  // 6. Procesar. Cualquier excepción ⇒ 500 para que MP reintente.
  try {
    const resultado = await procesarPago(
      dataId,
      mpEvent,
      crearDependenciasWebhook(),
      notificacion,
    );
    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error("[webhook mercadopago] error al procesar", error);
    return NextResponse.json(
      { mensaje: "Error al procesar la notificación." },
      { status: 500 },
    );
  }
}
