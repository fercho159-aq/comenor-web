/**
 * Envío del correo de confirmación de registro con el QR de acceso.
 * Implementación real de `DependenciasWebhook.enviarConfirmacion`.
 */
import { createElement } from "react";

import { ConfirmacionRegistro, asuntos } from "@/emails";
import { sitioUrl } from "@/emails/marca";
import { enviarCorreo } from "@/lib/email/resend";

import { generarQrDataUri } from "./qr-imagen";
import type { DatosConfirmacion, Modalidad } from "./procesar";

const ETIQUETA_MODALIDAD: Record<Modalidad, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  hibrida: "Híbrida",
};

export async function enviarConfirmacion(
  datos: DatosConfirmacion,
): Promise<void> {
  const qrDataUri = await generarQrDataUri(datos.token);

  const react = createElement(ConfirmacionRegistro, {
    nombre: datos.nombre,
    eventoNombre: datos.evento.nombre,
    eventoFecha: datos.evento.fecha,
    eventoSede: datos.evento.sede,
    eventoModalidad: ETIQUETA_MODALIDAD[datos.evento.modalidad],
    qrDataUri,
    folio: datos.folio,
    montoCentavos: datos.montoCentavos,
    urlEvento: `${sitioUrl}/eventos/${datos.evento.slug}`,
  });

  await enviarCorreo({
    to: datos.correo,
    subject: asuntos.confirmacionRegistro(datos.evento.nombre),
    react,
  });
}
