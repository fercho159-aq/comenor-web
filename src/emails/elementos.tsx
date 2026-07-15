import type { ReactNode } from "react";
import {
  Button,
  Column,
  Heading,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { familiaTipografica, marca } from "./marca";

/** Titular principal del cuerpo del correo (Montserrat Bold, verde). */
export function TituloCorreo({ children }: { children: ReactNode }) {
  return <Heading style={estiloTitulo}>{children}</Heading>;
}

/** Párrafo de cuerpo con la tipografía y el interlineado de marca. */
export function Parrafo({
  children,
  tenue = false,
}: {
  children: ReactNode;
  /** `tenue` usa el gris de labels para notas secundarias. */
  tenue?: boolean;
}) {
  return (
    <Text style={tenue ? estiloParrafoTenue : estiloParrafo}>{children}</Text>
  );
}

/** Botón/CTA sólido verde. `href` obligatorio (los correos no llevan handlers). */
export function BotonCorreo({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Section style={{ padding: "8px 0 4px" }}>
      <Button href={href} style={estiloBoton}>
        {children}
      </Button>
    </Section>
  );
}

/**
 * Panel de datos clave (evento, documento). Rectángulo `humo` con filas
 * etiqueta/valor. Se arma con tablas (Row/Column) para que Outlook lo respete.
 */
export function PanelDatos({ filas }: { filas: Array<[string, string]> }) {
  return (
    <Section style={estiloPanel}>
      {filas.map(([etiqueta, valor]) => (
        <Row key={etiqueta} style={{ marginBottom: "8px" }}>
          <Column style={estiloEtiquetaColumna}>
            <Text style={estiloEtiqueta}>{etiqueta}</Text>
          </Column>
          <Column>
            <Text style={estiloValor}>{valor}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

// ——— Estilos inline ———

const estiloTitulo = {
  color: marca.verde,
  fontFamily: familiaTipografica,
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: "1.25",
  margin: "0 0 16px",
};

const estiloParrafo = {
  color: marca.tinta,
  fontFamily: familiaTipografica,
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const estiloParrafoTenue = {
  ...estiloParrafo,
  color: marca.tintaSuave,
  fontSize: "14px",
};

const estiloBoton = {
  backgroundColor: marca.verde,
  borderRadius: "9999px",
  color: marca.blanco,
  fontFamily: familiaTipografica,
  fontSize: "16px",
  fontWeight: 700,
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const estiloPanel = {
  backgroundColor: marca.humo,
  padding: "20px 24px",
  margin: "8px 0 24px",
};

const estiloEtiquetaColumna = {
  width: "40%",
  verticalAlign: "top" as const,
};

const estiloEtiqueta = {
  color: marca.tintaSuave,
  fontFamily: familiaTipografica,
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  margin: "0",
};

const estiloValor = {
  color: marca.tinta,
  fontFamily: familiaTipografica,
  fontSize: "15px",
  fontWeight: 700,
  margin: "0",
};
