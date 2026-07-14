import { NextResponse } from "next/server";
import { contactoSchema } from "@/lib/schemas";

/**
 * POST /api/contacto — recepción del formulario público de contacto.
 *
 * Validación doble (PLAN.md): el cliente valida con `contactoSchema` antes de
 * enviar y este handler RE-VALIDA con el mismo esquema. Nunca se confía en el
 * cliente.
 */
export async function POST(request: Request): Promise<Response> {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(
      { mensaje: "El cuerpo de la petición no es JSON válido." },
      { status: 400 },
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

  // TODO(Resend): enviar el correo a direccioncomenor@comenor.org.mx con
  // `resultado.data` usando RESEND_API_KEY y EMAIL_FROM (ver .env.example).
  // Sin credenciales todavía: por ahora solo se registra en el servidor.
  console.log("[contacto] mensaje recibido", resultado.data);

  return NextResponse.json(
    { mensaje: "Gracias por escribirnos. Te responderemos a la brevedad." },
    { status: 200 },
  );
}
