/**
 * POST /api/eventos/[slug]/registro — registro público a un evento.
 *
 * Contrato (PLAN.md §1.6, §2.1):
 *   Body JSON: { nombre, cargo, correo, celular, organismo, solicitante }
 *              + campo honeypot `sitio_web` (debe llegar vacío).
 *
 *   Respuestas:
 *     201 { estado: "gratuito", registrationId, mensaje }      evento gratuito
 *     201 { estado: "pendiente", registrationId, initPoint }   evento de pago
 *     200 { mensaje }                                          honeypot (silencioso)
 *     400 { mensaje, errores }        JSON inválido o validación Zod por campo
 *     404 { mensaje }                 evento inexistente o no publicado
 *     409 { mensaje }                 registro cerrado / cupo lleno
 *     429 { mensaje }                 rate limit
 *     502 { mensaje }                 Mercado Pago no pudo crear la preferencia
 *
 * Seguridad:
 * - Validación DOBLE: el cliente valida con `registroEventoSchema`; este handler
 *   RE-VALIDA con el mismo esquema (campo vacío → 400 con error por campo).
 * - Honeypot + rate limit por IP antes de tocar la base de datos.
 * - El monto SIEMPRE sale de `events.costo_centavos` (BD), nunca del cliente.
 * - El QR se firma con HMAC; en BD se guarda SOLO el hash.
 */
import { createElement } from "react";

import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { asuntos, ConfirmacionRegistro } from "@/emails";
import { enviarCorreo } from "@/lib/email/resend";
import { crearPreferencia } from "@/lib/mercadopago/client";
import { firmarToken, hashParaBD } from "@/lib/qr/token";
import { CAMPO_HONEYPOT, esHoneypotDisparado, limitar } from "@/lib/ratelimit";
import { ipConfiable } from "@/lib/net/ip";
import { siteUrl } from "@/lib/net/site-url";
import { registroEventoSchema } from "@/lib/schemas";
import type { Event } from "@/db/schema";

import {
  buscarEventoPorSlug,
  contarRegistrosActivos,
  crearRegistro,
  guardarHashQr,
} from "../../_datos";

/** Etiquetas legibles de la modalidad para el correo de confirmación. */
const ETIQUETA_MODALIDAD: Record<Event["modalidad"], string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  hibrida: "Híbrida",
};

/** Estados de evento en los que se puede registrar. */
const ESTADOS_ABIERTOS: ReadonlyArray<Event["estado"]> = [
  "programado",
  "en_curso",
];


export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;

  // 1) Rate limit por IP (antes de parsear/persistir).
  const limite = await limitar(`registro-evento:${ipConfiable(request.headers)}`, {
    limite: 5,
    ventanaSegundos: 60,
  });
  if (!limite.permitido) {
    return NextResponse.json(
      {
        mensaje:
          "Demasiados intentos. Espera un momento antes de volver a intentarlo.",
      },
      { status: 429 },
    );
  }

  // 2) Cuerpo JSON.
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(
      { mensaje: "El cuerpo de la petición no es JSON válido." },
      { status: 400 },
    );
  }

  // 3) Honeypot: si viene lleno es un bot. Respondemos 200 genérico SIN
  //    persistir nada, para no revelar la trampa.
  const honeypot =
    typeof cuerpo === "object" && cuerpo !== null
      ? (cuerpo as Record<string, unknown>)[CAMPO_HONEYPOT]
      : undefined;
  if (esHoneypotDisparado(honeypot)) {
    return NextResponse.json(
      { mensaje: "Tu registro fue recibido." },
      { status: 200 },
    );
  }

  // 4) Validación doble con el esquema Zod compartido.
  const resultado = registroEventoSchema.safeParse(cuerpo);
  if (!resultado.success) {
    return NextResponse.json(
      {
        mensaje: "Revisa los campos marcados.",
        errores: resultado.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  const datos = resultado.data;

  // 5) Evento: debe existir y estar publicado.
  const evento = await buscarEventoPorSlug(slug);
  if (!evento || !evento.publicado) {
    return NextResponse.json(
      { mensaje: "El evento no existe o no está disponible." },
      { status: 404 },
    );
  }

  // 6) Registro abierto (bandera + estado del ciclo de vida).
  if (!evento.registroAbierto || !ESTADOS_ABIERTOS.includes(evento.estado)) {
    return NextResponse.json(
      { mensaje: "El registro para este evento está cerrado." },
      { status: 409 },
    );
  }

  // 7) Cupo. `cupo === null` = ilimitado. Los pendientes cuentan (anti-sobreventa).
  if (evento.cupo !== null) {
    const ocupados = await contarRegistrosActivos(evento.id);
    if (ocupados >= evento.cupo) {
      return NextResponse.json(
        { mensaje: "Cupo lleno. Ya no hay lugares disponibles para este evento." },
        { status: 409 },
      );
    }
  }

  const esGratuito = evento.costoCentavos === 0;

  // 8a) Evento GRATUITO: registro confirmado + QR + correo. No toca Mercado Pago.
  if (esGratuito) {
    const registro = await crearRegistro({
      eventId: evento.id,
      nombre: datos.nombre,
      cargo: datos.cargo,
      correo: datos.correo,
      celular: datos.celular,
      organismo: datos.organismo,
      solicitante: datos.solicitante,
      estadoPago: "gratuito",
    });

    // QR firmado: el token viaja solo en el correo; en BD guardamos su hash.
    const token = firmarToken({
      registrationId: registro.id,
      eventId: evento.id,
    });
    await guardarHashQr(registro.id, hashParaBD(token));

    // Encolar el correo de confirmación (best-effort: no bloquea el 201).
    try {
      const qrDataUri = await QRCode.toDataURL(token, { margin: 1, width: 320 });
      await enviarCorreo({
        to: registro.correo,
        subject: asuntos.confirmacionRegistro(evento.nombre),
        react: createElement(ConfirmacionRegistro, {
          nombre: registro.nombre,
          eventoNombre: evento.nombre,
          eventoFecha: evento.fecha,
          eventoSede: evento.sede,
          eventoModalidad: ETIQUETA_MODALIDAD[evento.modalidad],
          qrDataUri,
          folio: registro.id,
          montoCentavos: 0,
          urlEvento: `${siteUrl()}/eventos/${evento.slug}`,
        }),
      });
    } catch (error) {
      // El registro y el QR ya quedaron; el correo se puede reenviar desde admin.
      console.error(
        `[registro] no se pudo enviar la confirmación de ${registro.id}:`,
        error instanceof Error ? error.message : error,
      );
    }

    return NextResponse.json(
      {
        estado: "gratuito",
        registrationId: registro.id,
        mensaje:
          "Registro confirmado. Te enviamos un correo con tu código QR de acceso.",
      },
      { status: 201 },
    );
  }

  // 8b) Evento DE PAGO: registro pendiente + preferencia de Mercado Pago.
  const registro = await crearRegistro({
    eventId: evento.id,
    nombre: datos.nombre,
    cargo: datos.cargo,
    correo: datos.correo,
    celular: datos.celular,
    organismo: datos.organismo,
    solicitante: datos.solicitante,
    estadoPago: "pendiente",
  });

  try {
    // URL canónica del env (siteUrl), nunca el Host/Origin entrante: evita
    // host-header injection en back_urls y en el notification_url del webhook.
    const base = siteUrl();
    const preferencia = await crearPreferencia({
      registrationId: registro.id,
      tituloEvento: evento.nombre,
      costoCentavos: evento.costoCentavos, // monto desde la BD, nunca del cliente
      correo: registro.correo,
      nombre: registro.nombre,
      urlExito: `${base}/eventos/${evento.slug}?pago=exito`,
      urlError: `${base}/eventos/${evento.slug}?pago=error`,
      urlPendiente: `${base}/eventos/${evento.slug}?pago=pendiente`,
      // Ruta REAL del webhook (antes apuntaba a /api/pagos/webhook, inexistente,
      // lo que dejaba todo pago sin confirmar). Ver src/app/api/webhooks/mercadopago.
      urlWebhook: `${base}/api/webhooks/mercadopago`,
    });

    return NextResponse.json(
      {
        estado: "pendiente",
        registrationId: registro.id,
        initPoint: preferencia.initPoint,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      `[registro] Mercado Pago falló para ${registro.id}:`,
      error instanceof Error ? error.message : error,
    );
    // El registro quedó como `pendiente`; el usuario puede reintentar el pago.
    return NextResponse.json(
      {
        mensaje:
          "No pudimos iniciar el pago en este momento. Inténtalo de nuevo en unos minutos.",
        registrationId: registro.id,
      },
      { status: 502 },
    );
  }
}
