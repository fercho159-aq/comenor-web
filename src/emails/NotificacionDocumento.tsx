import DisenoBase from "./DisenoBase";
import { BotonCorreo, PanelDatos, Parrafo, TituloCorreo } from "./elementos";
import { nombreMes } from "./marca";

/** Etiquetas legibles del nivel de acceso (espeja el enum de Postgres). */
const ETIQUETA_NIVEL: Record<string, string> = {
  publico: "Público",
  asociados: "Asociados",
  consejo: "Consejo",
};

export type NotificacionDocumentoProps = {
  /** Nombre del destinatario. Si no se conoce, se usa un saludo genérico. */
  nombreDestinatario?: string;
  /** Título del documento publicado. */
  documentoTitulo: string;
  /** Tipo de documento (acta, minuta, boletín, etc.). */
  documentoTipo: string;
  /** Mes de referencia del documento (1–12). */
  mes: number;
  /** Año de referencia del documento. */
  anio: number;
  /** Nivel de acceso: `publico` | `asociados` | `consejo`. */
  nivelAcceso: "publico" | "asociados" | "consejo";
  /** URL del micrositio donde consultar el documento (requiere sesión). */
  urlAcceso: string;
};

/**
 * Aviso a los destinatarios de que se publicó un nuevo documento en el
 * micrositio de miembros. No adjunta el archivo: enlaza al visor protegido
 * (URLs firmadas de vida corta, PLAN.md §2.7).
 */
export default function NotificacionDocumento({
  nombreDestinatario,
  documentoTitulo,
  documentoTipo,
  mes,
  anio,
  nivelAcceso,
  urlAcceso,
}: NotificacionDocumentoProps) {
  const saludo = nombreDestinatario ? `Hola ${nombreDestinatario},` : "Hola,";
  const periodo = `${capitalizar(nombreMes(mes))} de ${anio}`;

  return (
    <DisenoBase
      vistaPrevia={`Nuevo documento disponible: ${documentoTitulo}`}
      encabezado="COMENOR"
    >
      <TituloCorreo>Nuevo documento disponible</TituloCorreo>
      <Parrafo>
        {saludo} se publicó un nuevo documento en el micrositio de miembros de
        COMENOR.
      </Parrafo>

      <PanelDatos
        filas={[
          ["Título", documentoTitulo],
          ["Tipo", documentoTipo],
          ["Periodo", periodo],
          ["Acceso", ETIQUETA_NIVEL[nivelAcceso] ?? nivelAcceso],
        ]}
      />

      <Parrafo>
        Puedes consultarlo iniciando sesión en el micrositio. Por seguridad, el
        documento se abre en el visor y no se envía como archivo adjunto.
      </Parrafo>

      <BotonCorreo href={urlAcceso}>Consultar documento</BotonCorreo>

      <Parrafo tenue>
        Si el botón no funciona, copia y pega esta dirección en tu navegador:{" "}
        {urlAcceso}
      </Parrafo>
    </DisenoBase>
  );
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

NotificacionDocumento.PreviewProps = {
  nombreDestinatario: "Ing. Roberto Méndez",
  documentoTitulo: "Acta de la Sesión Ordinaria del Consejo Directivo",
  documentoTipo: "Acta",
  mes: 7,
  anio: 2026,
  nivelAcceso: "consejo",
  urlAcceso: "https://miembros.comenor.org.mx/documentos/acta-julio-2026",
} satisfies NotificacionDocumentoProps;
