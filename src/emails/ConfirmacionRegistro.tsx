import { Img, Section, Text } from "@react-email/components";
import DisenoBase from "./DisenoBase";
import { BotonCorreo, PanelDatos, Parrafo, TituloCorreo } from "./elementos";
import { familiaTipografica, formatearFechaHora, formatearMonto, marca } from "./marca";

export type ConfirmacionRegistroProps = {
  /** Nombre de la persona registrada. */
  nombre: string;
  /** Nombre del evento. */
  eventoNombre: string;
  /** Fecha y hora del evento (se formatea a es-MX / America/Mexico_City). */
  eventoFecha: Date;
  /** Sede o liga de acceso, según modalidad. */
  eventoSede: string;
  /** Etiqueta legible de la modalidad ("Presencial", "Virtual", "Híbrida"). */
  eventoModalidad: string;
  /**
   * QR embebido como imagen (data URI: `data:image/png;base64,...`).
   * Lo genera el backend con `qrcode` a partir del token firmado HMAC; aquí solo
   * se muestra. Si el evento no requiere QR (p. ej. gratuito sin control de
   * acceso) se puede omitir.
   */
  qrDataUri?: string;
  /** Folio del registro (id), útil como referencia en soporte. */
  folio?: string;
  /**
   * Monto pagado en centavos MXN. `0` o `null`/omitido => evento gratuito.
   */
  montoCentavos?: number | null;
  /** URL pública del evento (landing compartible). */
  urlEvento?: string;
};

/**
 * Correo de confirmación de registro a un evento COMENOR.
 * Incluye los datos del evento, el estado de pago y el código QR de acceso
 * embebido como imagen para el check-in.
 */
export default function ConfirmacionRegistro({
  nombre,
  eventoNombre,
  eventoFecha,
  eventoSede,
  eventoModalidad,
  qrDataUri,
  folio,
  montoCentavos,
  urlEvento,
}: ConfirmacionRegistroProps) {
  const esGratuito = montoCentavos == null || montoCentavos === 0;
  const filas: Array<[string, string]> = [
    ["Evento", eventoNombre],
    ["Fecha", formatearFechaHora(eventoFecha)],
    ["Modalidad", eventoModalidad],
    ["Sede", eventoSede],
    ["Costo", esGratuito ? "Gratuito" : formatearMonto(montoCentavos)],
  ];
  if (folio) filas.push(["Folio", folio]);

  return (
    <DisenoBase
      vistaPrevia={`Tu registro a ${eventoNombre} está confirmado.`}
      encabezado="COMENOR"
    >
      <TituloCorreo>Registro confirmado</TituloCorreo>
      <Parrafo>
        Hola <strong>{nombre}</strong>, tu registro a{" "}
        <strong>{eventoNombre}</strong> quedó confirmado. Aquí están los
        detalles:
      </Parrafo>

      <PanelDatos filas={filas} />

      {qrDataUri ? (
        <Section style={seccionQr}>
          <Text style={textoQr}>
            Presenta este código QR en el acceso el día del evento:
          </Text>
          <Img
            src={qrDataUri}
            alt={`Código QR de acceso para ${eventoNombre}`}
            width={200}
            height={200}
            style={imagenQr}
          />
          <Text style={textoQrTenue}>
            Es personal e intransferible: solo puede usarse una vez.
          </Text>
        </Section>
      ) : null}

      {urlEvento ? (
        <BotonCorreo href={urlEvento}>Ver detalles del evento</BotonCorreo>
      ) : null}

      <Parrafo tenue>
        Si tienes dudas sobre tu registro, responde a este correo y con gusto te
        ayudamos.
      </Parrafo>
    </DisenoBase>
  );
}

// Datos de ejemplo para el servidor de vista previa de React Email (`email dev`).
ConfirmacionRegistro.PreviewProps = {
  nombre: "María Fernanda López",
  eventoNombre: "Foro de Infraestructura de la Calidad 2026",
  eventoFecha: new Date("2026-09-24T17:00:00.000Z"),
  eventoSede: "Centro Citibanamex, Ciudad de México",
  eventoModalidad: "Presencial",
  qrDataUri:
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  folio: "e3b0c442-98fc-1c14-9afb-4c8996fb9242",
  montoCentavos: 150000,
  urlEvento: "https://comenor.org.mx/eventos/foro-ic-2026",
} satisfies ConfirmacionRegistroProps;

const seccionQr = {
  textAlign: "center" as const,
  padding: "8px 0 16px",
};

const textoQr = {
  color: marca.tinta,
  fontFamily: familiaTipografica,
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

const imagenQr = {
  border: `8px solid ${marca.blanco}`,
  outline: `1px solid ${marca.humo}`,
  margin: "0 auto",
};

const textoQrTenue = {
  color: marca.tintaSuave,
  fontFamily: familiaTipografica,
  fontSize: "13px",
  margin: "16px 0 0",
};
