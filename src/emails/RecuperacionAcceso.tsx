import DisenoBase from "./DisenoBase";
import { BotonCorreo, Parrafo, TituloCorreo } from "./elementos";

export type RecuperacionAccesoProps = {
  /** Nombre de la persona. Si no se conoce, se usa un saludo genérico. */
  nombre?: string;
  /** URL firmada de un solo uso para restablecer la contraseña. */
  urlRecuperacion: string;
  /** Vigencia del enlace en minutos (por defecto 60). */
  minutosVigencia?: number;
};

/**
 * Correo de recuperación de acceso (restablecer contraseña) del micrositio.
 * El enlace lo genera Supabase Auth / el backend; aquí solo se presenta. La
 * vigencia se comunica explícitamente para que el usuario no lo posponga.
 */
export default function RecuperacionAcceso({
  nombre,
  urlRecuperacion,
  minutosVigencia = 60,
}: RecuperacionAccesoProps) {
  const saludo = nombre ? `Hola ${nombre},` : "Hola,";

  return (
    <DisenoBase
      vistaPrevia="Restablece tu contraseña de acceso a COMENOR"
      encabezado="COMENOR"
    >
      <TituloCorreo>Restablece tu contraseña</TituloCorreo>
      <Parrafo>
        {saludo} recibimos una solicitud para restablecer la contraseña de tu
        cuenta en el micrositio de COMENOR. Para continuar, usa el siguiente
        botón:
      </Parrafo>

      <BotonCorreo href={urlRecuperacion}>Crear nueva contraseña</BotonCorreo>

      <Parrafo tenue>
        Por seguridad, este enlace vence en {minutosVigencia} minutos y solo
        puede usarse una vez.
      </Parrafo>

      <Parrafo tenue>
        Si tú no solicitaste este cambio, ignora este correo: tu contraseña
        seguirá siendo la misma. Si el botón no funciona, copia y pega esta
        dirección en tu navegador: {urlRecuperacion}
      </Parrafo>
    </DisenoBase>
  );
}

RecuperacionAcceso.PreviewProps = {
  nombre: "María Fernanda López",
  urlRecuperacion:
    "https://miembros.comenor.org.mx/recuperacion?token=ejemplo-firmado",
  minutosVigencia: 60,
} satisfies RecuperacionAccesoProps;
