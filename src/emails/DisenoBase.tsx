import type { ReactNode } from "react";
import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { familiaTipografica, marca, sitioUrl } from "./marca";

type DisenoBaseProps = {
  /** Texto del "preheader" (vista previa en la bandeja, antes de abrir). */
  vistaPrevia: string;
  /** Título en la barra verde superior. Por defecto, el nombre de la marca. */
  encabezado?: string;
  children: ReactNode;
};

/**
 * Cascarón compartido por todos los correos de COMENOR.
 *
 * Decisiones para compatibilidad con clientes de correo:
 *  - Todo el estilo va INLINE (los componentes de React Email emiten tablas y
 *    atributos que Gmail/Outlook respetan; nada de clases CSS externas).
 *  - Fondo `humo` (marca) con una tarjeta blanca centrada de ancho fijo.
 *  - Barra `verde` arriba y filete `vino` abajo: los dos gestos de la marca
 *    (docs/BRAND.md) reproducibles con rectángulos sólidos, sin imágenes.
 *  - `<Font>` inyecta Montserrat con fallback seguro para quien no la cargue.
 */
export default function DisenoBase({
  vistaPrevia,
  encabezado = "COMENOR",
  children,
}: DisenoBaseProps) {
  return (
    <Html lang="es-MX" dir="ltr">
      <Head>
        <Font
          fontFamily="Montserrat"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          webFont={{
            url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXo.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Montserrat"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          webFont={{
            url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXo.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Preview>{vistaPrevia}</Preview>
      <Body style={cuerpo}>
        <Container style={tarjeta}>
          {/* Barra verde de marca */}
          <Section style={barraEncabezado}>
            <Text style={textoEncabezado}>{encabezado}</Text>
          </Section>

          {/* Contenido del correo */}
          <Section style={contenido}>{children}</Section>

          <Hr style={separador} />

          {/* Pie institucional */}
          <Section style={pie}>
            <Text style={textoPie}>
              Consejo Mexicano de Normalización y Evaluación de la Conformidad,
              A.C.
            </Text>
            <Text style={textoPie}>
              <Link href={sitioUrl} style={enlacePie}>
                comenor.org.mx
              </Link>
            </Text>
            <Text style={textoPieTenue}>
              Recibiste este correo porque tu dirección está registrada en una
              actividad de COMENOR. Si no reconoces este mensaje, puedes
              ignorarlo.
            </Text>
          </Section>
        </Container>

        {/* Filete vino al 100% del ancho, gesto de marca al pie */}
        <Section style={fileteVino} />
      </Body>
    </Html>
  );
}

// ——— Estilos inline ———

const cuerpo = {
  backgroundColor: marca.humo,
  fontFamily: familiaTipografica,
  margin: "0",
  padding: "24px 0",
};

const tarjeta = {
  backgroundColor: marca.blanco,
  maxWidth: "600px",
  width: "100%",
  margin: "0 auto",
  overflow: "hidden" as const,
};

const barraEncabezado = {
  backgroundColor: marca.verde,
  padding: "20px 32px",
};

const textoEncabezado = {
  color: marca.blanco,
  fontFamily: familiaTipografica,
  fontSize: "22px",
  fontWeight: 700,
  letterSpacing: "0.18em",
  margin: "0",
};

const contenido = {
  padding: "32px",
};

const separador = {
  borderColor: marca.humo,
  borderTop: `1px solid ${marca.humo}`,
  margin: "0",
};

const pie = {
  padding: "24px 32px 32px",
};

const textoPie = {
  color: marca.tintaSuave,
  fontFamily: familiaTipografica,
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 4px",
};

const textoPieTenue = {
  color: marca.tintaSuave,
  fontFamily: familiaTipografica,
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "12px 0 0",
};

const enlacePie = {
  color: marca.verde,
  fontFamily: familiaTipografica,
  fontSize: "13px",
  fontWeight: 700,
  textDecoration: "none",
};

const fileteVino = {
  backgroundColor: marca.vino,
  height: "8px",
  maxWidth: "600px",
  width: "100%",
  margin: "0 auto",
};
