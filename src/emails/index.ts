/**
 * Punto de entrada de las plantillas de correo transaccional (React Email).
 *
 * Uso desde el backend (agente A2):
 *   import { renderizarCorreo, ConfirmacionRegistro } from "@/emails";
 *   const { html, texto } = await renderizarCorreo(
 *     ConfirmacionRegistro, { ...props }
 *   );
 *   await resend.emails.send({ from, to, subject, html, text: texto });
 *
 * Cada plantilla se renderiza a HTML y a texto plano con el mismo componente
 * (React Email genera el texto plano con `plainText: true`), cumpliendo la regla
 * de "versión texto plano" de PLAN.md §2.19 sin mantener dos cuerpos a mano.
 */
import { createElement, type ComponentType } from "react";
import { render } from "@react-email/components";

export { default as ConfirmacionRegistro } from "./ConfirmacionRegistro";
export type { ConfirmacionRegistroProps } from "./ConfirmacionRegistro";
export { default as NotificacionDocumento } from "./NotificacionDocumento";
export type { NotificacionDocumentoProps } from "./NotificacionDocumento";
export { default as RecuperacionAcceso } from "./RecuperacionAcceso";
export type { RecuperacionAccesoProps } from "./RecuperacionAcceso";

/** Asuntos sugeridos por plantilla (copy en español, sin datos sensibles). */
export const asuntos = {
  confirmacionRegistro: (eventoNombre: string) =>
    `Registro confirmado: ${eventoNombre}`,
  notificacionDocumento: (documentoTitulo: string) =>
    `Nuevo documento disponible: ${documentoTitulo}`,
  recuperacionAcceso: () => "Restablece tu contraseña de acceso a COMENOR",
} as const;

/**
 * Renderiza una plantilla a HTML y texto plano en una sola llamada.
 * Genérico sobre las props del componente para conservar el tipado.
 */
export async function renderizarCorreo<P extends object>(
  Plantilla: ComponentType<P>,
  props: P,
): Promise<{ html: string; texto: string }> {
  const elemento = createElement(Plantilla, props);
  const [html, texto] = await Promise.all([
    render(elemento),
    render(elemento, { plainText: true }),
  ]);
  return { html, texto };
}
