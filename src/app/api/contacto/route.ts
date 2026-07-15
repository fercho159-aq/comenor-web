import { NextResponse } from "next/server";
import { createElement } from "react";

import { enviarCorreo } from "@/lib/email/resend";
import { ipConfiable } from "@/lib/net/ip";
import CorreoContacto from "@/lib/notificaciones/CorreoContacto";
import { CAMPO_HONEYPOT, esHoneypotDisparado, limitar } from "@/lib/ratelimit";
import { contactoSchema } from "@/lib/schemas";

/**
 * Destinatario interno del formulario de contacto (documentado en el TODO
 * previo del handler). No es secreto; el remitente real es `EMAIL_FROM`.
 */
const DESTINATARIO_CONTACTO = "direccioncomenor@comenor.org.mx";

/**
 * POST /api/contacto — recepción del formulario público de contacto.
 *
 * Validación doble (PLAN.md): el cliente valida con `contactoSchema` antes de
 * enviar y este handler RE-VALIDA con el mismo esquema. Nunca se confía en el
 * cliente. Tras validar, envía el correo al equipo vía `enviarCorreo`
 * (`replyTo` = correo del remitente). Sin `RESEND_API_KEY` (dev) el envío se
 * simula y no falla; si Resend falla en prod se responde 502 para reintentar.
 */
export async function POST(request: Request): Promise<Response> {
  // Rate limit por IP de confianza: cada POST válido dispara un correo, así que
  // sin freno un bot podría inundar la bandeja del Consejo / agotar la cuota de
  // Resend (mail bombing).
  const limite = await limitar(`contacto:${ipConfiable(request.headers)}`, {
    limite: 3,
    ventanaSegundos: 60,
  });
  if (!limite.permitido) {
    return NextResponse.json(
      {
        mensaje:
          "Demasiados mensajes. Espera un momento antes de volver a intentarlo.",
      },
      { status: 429 },
    );
  }

  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(
      { mensaje: "El cuerpo de la petición no es JSON válido." },
      { status: 400 },
    );
  }

  // Honeypot: campo oculto que solo un bot rellena. Respuesta 200 genérica sin
  // enviar correo, para no revelar la trampa.
  const honeypot =
    typeof cuerpo === "object" && cuerpo !== null
      ? (cuerpo as Record<string, unknown>)[CAMPO_HONEYPOT]
      : undefined;
  if (esHoneypotDisparado(honeypot)) {
    return NextResponse.json(
      { mensaje: "Gracias por escribirnos. Te responderemos a la brevedad." },
      { status: 200 },
    );
  }

  const resultado = contactoSchema.safeParse(cuerpo);

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

  try {
    await enviarCorreo({
      to: DESTINATARIO_CONTACTO,
      subject: `Contacto: ${datos.asunto}`,
      react: createElement(CorreoContacto, {
        nombre: datos.nombre,
        correo: datos.correo,
        telefono: datos.telefono || undefined,
        asunto: datos.asunto,
        mensaje: datos.mensaje,
      }),
      replyTo: datos.correo,
    });
  } catch (error) {
    console.error("[contacto] no se pudo enviar el correo", error);
    return NextResponse.json(
      {
        mensaje:
          "No pudimos enviar tu mensaje en este momento. Inténtalo de nuevo en unos minutos.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { mensaje: "Gracias por escribirnos. Te responderemos a la brevedad." },
    { status: 200 },
  );
}
