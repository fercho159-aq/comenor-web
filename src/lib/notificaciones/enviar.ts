/**
 * Orquestación de correos transaccionales COMENOR — PLAN.md §A2 / §2.19.
 *
 * Este módulo NO habla con Resend directamente: envuelve las plantillas React
 * Email (`@/emails`) y las despacha con `enviarCorreo` (`@/lib/email/resend`).
 * En desarrollo sin `RESEND_API_KEY`, `enviarCorreo` simula y loguea sin fallar,
 * de modo que estos flujos (confirmación de registro, notificación documental)
 * corren en local sin servicios vivos.
 *
 * Toda la lógica de selección de destinatarios es PURA (`seleccionarDestinatarios`)
 * para poder probarla con mocks. Las lecturas a base de datos viven aparte en
 * `@/lib/notificaciones/consultas`.
 */
import { createElement } from "react";

import { asuntos, ConfirmacionRegistro, NotificacionDocumento } from "@/emails";
import { enviarCorreo, type ResultadoEnvio } from "@/lib/email/resend";
import { nivelesAcceso } from "@/lib/schemas";
import type { EmailRecipient } from "@/db/schema";

/** Nivel de acceso de un documento (espeja el enum de Postgres). */
export type NivelAcceso = (typeof nivelesAcceso)[number];

// ---------------------------------------------------------------------------
// Confirmación de registro a un evento (pago aprobado o evento gratuito)
// ---------------------------------------------------------------------------

/** Datos para la confirmación de registro. `correo` es el destinatario. */
export interface DatosConfirmacionRegistro {
  /** Correo del registrado (destinatario del mensaje). */
  correo: string;
  nombre: string;
  eventoNombre: string;
  /** Fecha/hora del evento; la plantilla la formatea a es-MX. */
  eventoFecha: Date;
  eventoSede: string;
  /** Etiqueta legible: "Presencial" | "Virtual" | "Híbrida". */
  eventoModalidad: string;
  /** QR embebido como data URI (`data:image/png;base64,...`). Opcional. */
  qrDataUri?: string;
  /** Folio del registro (id). Opcional. */
  folio?: string;
  /** Monto pagado en centavos MXN. `0`/`null`/omitido => gratuito. */
  montoCentavos?: number | null;
  /** Landing pública del evento. Opcional. */
  urlEvento?: string;
  /** Responder-a opcional (p. ej. contacto@comenor.org.mx). */
  replyTo?: string;
}

/**
 * Envía el correo `ConfirmacionRegistro`. Lo invoca el flujo de registro:
 * al aprobarse un pago (webhook de Mercado Pago) o al registrarse a un evento
 * gratuito. Devuelve `{ simulado: true }` en dev sin `RESEND_API_KEY`.
 */
export async function enviarConfirmacionRegistro(
  datos: DatosConfirmacionRegistro,
): Promise<ResultadoEnvio> {
  return enviarCorreo({
    to: datos.correo,
    subject: asuntos.confirmacionRegistro(datos.eventoNombre),
    react: createElement(ConfirmacionRegistro, {
      nombre: datos.nombre,
      eventoNombre: datos.eventoNombre,
      eventoFecha: datos.eventoFecha,
      eventoSede: datos.eventoSede,
      eventoModalidad: datos.eventoModalidad,
      qrDataUri: datos.qrDataUri,
      folio: datos.folio,
      montoCentavos: datos.montoCentavos,
      urlEvento: datos.urlEvento,
    }),
    ...(datos.replyTo ? { replyTo: datos.replyTo } : {}),
  });
}

// ---------------------------------------------------------------------------
// Notificación documental (se publicó un documento en el micrositio)
// ---------------------------------------------------------------------------

/** Datos del documento publicado para armar la notificación. */
export interface DatosNotificacionDocumento {
  documentoTitulo: string;
  documentoTipo: string;
  /** Mes de referencia (1–12). */
  mes: number;
  /** Año de referencia. */
  anio: number;
  nivelAcceso: NivelAcceso;
  /** URL del micrositio (protegido) donde consultar el documento. */
  urlAcceso: string;
}

/** Resultado agregado del envío documental. */
export interface ResultadoNotificacionDocumento {
  /** Cantidad de destinatarios a los que se despachó el correo. */
  enviados: number;
  /** Resultado individual por destinatario (mismo orden que la selección). */
  resultados: ResultadoEnvio[];
}

/**
 * Selecciona, de una lista de destinatarios, SOLO los que deben ser avisados de
 * un documento con el `nivelAcceso` dado. Función pura (sin I/O) para tests.
 *
 * Regla (PLAN §A2): destinatario activo cuyo `perfil` coincide con el
 * `nivel_acceso` del documento. La coincidencia es exacta: un documento de
 * nivel `consejo` solo notifica a perfiles `consejo`; uno de nivel `asociados`
 * solo a perfiles `asociados`. Nota: `nivel_acceso` incluye `publico` (sin
 * perfil equivalente ⇒ nadie recibe aviso, es contenido público) y el perfil
 * `admin` no tiene nivel equivalente (los admins publican, no se autoavisan).
 * Ver "columnas/enum" en la entrega si se requiere jerarquía en vez de match.
 */
export function seleccionarDestinatarios(
  destinatarios: readonly EmailRecipient[],
  nivelAcceso: NivelAcceso,
): EmailRecipient[] {
  return destinatarios.filter((d) => d.activo && d.perfil === nivelAcceso);
}

/**
 * Envía `NotificacionDocumento` a los destinatarios cuyo perfil corresponde al
 * nivel de acceso del documento. Un correo por destinatario (sin exponer las
 * direcciones entre sí). Devuelve el conteo enviado y el resultado por correo.
 */
export async function enviarNotificacionDocumento(
  destinatarios: readonly EmailRecipient[],
  datos: DatosNotificacionDocumento,
): Promise<ResultadoNotificacionDocumento> {
  const seleccion = seleccionarDestinatarios(destinatarios, datos.nivelAcceso);

  const resultados = await Promise.all(
    seleccion.map((destinatario) =>
      enviarCorreo({
        to: destinatario.correo,
        subject: asuntos.notificacionDocumento(datos.documentoTitulo),
        react: createElement(NotificacionDocumento, {
          documentoTitulo: datos.documentoTitulo,
          documentoTipo: datos.documentoTipo,
          mes: datos.mes,
          anio: datos.anio,
          nivelAcceso: datos.nivelAcceso,
          urlAcceso: datos.urlAcceso,
        }),
      }),
    ),
  );

  return { enviados: resultados.length, resultados };
}
