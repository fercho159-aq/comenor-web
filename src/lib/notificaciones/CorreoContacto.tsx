/**
 * Correo interno que recibe el equipo de COMENOR cuando alguien envía el
 * formulario público de contacto. No es una plantilla de cara al usuario, por
 * eso vive junto al orquestador de notificaciones y no en `@/emails` (que
 * agrupa las plantillas transaccionales que sí ve el público).
 *
 * El `replyTo` del envío se fija al correo del remitente para que el equipo
 * pueda responder directamente desde su cliente de correo.
 */
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type CorreoContactoProps = {
  nombre: string;
  correo: string;
  /** Teléfono a 10 dígitos, opcional. */
  telefono?: string;
  asunto: string;
  mensaje: string;
};

export default function CorreoContacto({
  nombre,
  correo,
  telefono,
  asunto,
  mensaje,
}: CorreoContactoProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{`Nuevo mensaje de contacto: ${asunto}`}</Preview>
      <Body style={cuerpo}>
        <Container style={contenedor}>
          <Heading style={titulo}>Nuevo mensaje de contacto</Heading>

          <Section>
            <Text style={etiqueta}>Nombre</Text>
            <Text style={valor}>{nombre}</Text>

            <Text style={etiqueta}>Correo</Text>
            <Text style={valor}>{correo}</Text>

            {telefono ? (
              <>
                <Text style={etiqueta}>Teléfono</Text>
                <Text style={valor}>{telefono}</Text>
              </>
            ) : null}

            <Text style={etiqueta}>Asunto</Text>
            <Text style={valor}>{asunto}</Text>
          </Section>

          <Hr style={separador} />

          <Text style={etiqueta}>Mensaje</Text>
          <Text style={valor}>{mensaje}</Text>
        </Container>
      </Body>
    </Html>
  );
}

CorreoContacto.PreviewProps = {
  nombre: "María Fernanda López",
  correo: "maria.lopez@ejemplo.mx",
  telefono: "5512345678",
  asunto: "Solicitud de información sobre afiliación",
  mensaje:
    "Buenas tardes, me gustaría conocer los requisitos para afiliarme como organismo. Quedo atenta. Gracias.",
} satisfies CorreoContactoProps;

const cuerpo = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: "0",
  padding: "24px 0",
};

const contenedor = {
  backgroundColor: "#ffffff",
  border: "1px solid #e4e4e7",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "24px",
};

const titulo = {
  color: "#18181b",
  fontSize: "20px",
  fontWeight: 700,
  margin: "0 0 16px",
};

const etiqueta = {
  color: "#71717a",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.04em",
  margin: "12px 0 2px",
  textTransform: "uppercase" as const,
};

const valor = {
  color: "#18181b",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const separador = {
  borderColor: "#e4e4e7",
  margin: "20px 0",
};
