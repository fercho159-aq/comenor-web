/**
 * Panel admin · Nuevo evento.
 * Re-exige rol `admin` y renderiza el formulario cableado a `crearEvento`.
 */
import { LayoutAdmin } from "@/components/admin";
import { requireRol } from "@/lib/auth/roles";

import { crearEvento } from "../acciones";
import { nombrePanel } from "../_usuario";
import FormularioEvento from "../FormularioEvento";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nuevo evento · Panel COMENOR",
};

export default async function PaginaNuevoEvento() {
  const { user, rol } = await requireRol(["admin"], { redirigirA: "/login" });

  const usuario = {
    nombre: nombrePanel(user),
    correo: user.email ?? "",
    rol,
  };

  return (
    <LayoutAdmin titulo="Nuevo evento" usuario={usuario}>
      <FormularioEvento accion={crearEvento} textoEnvio="Crear evento" />
    </LayoutAdmin>
  );
}
