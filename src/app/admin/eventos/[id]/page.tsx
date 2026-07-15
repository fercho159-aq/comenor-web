/**
 * Panel admin · Editar evento.
 * Re-exige rol `admin`, carga el evento y cablea el formulario a
 * `actualizarEvento` (vinculando el id de forma segura en el servidor).
 */
import { notFound } from "next/navigation";

import { LayoutAdmin } from "@/components/admin";
import { requireRol } from "@/lib/auth/roles";

import { actualizarEvento } from "../acciones";
import { buscarEventoPorId } from "../_datos";
import { fechaParaInput } from "../_formato";
import { nombrePanel } from "../_usuario";
import FormularioEvento, { type ValoresEvento } from "../FormularioEvento";
import { centavosAPesos } from "../logica";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editar evento · Panel COMENOR",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PaginaEditarEvento({ params }: Props) {
  const { user, rol } = await requireRol(["admin"], { redirigirA: "/login" });
  const { id } = await params;

  const evento = await buscarEventoPorId(id);
  if (!evento) {
    notFound();
  }

  const usuario = {
    nombre: nombrePanel(user),
    correo: user.email ?? "",
    rol,
  };

  const valores: ValoresEvento = {
    nombre: evento.nombre,
    slug: evento.slug,
    fecha: fechaParaInput(evento.fecha),
    sede: evento.sede,
    modalidad: evento.modalidad,
    costoPesos: centavosAPesos(evento.costoCentavos).toString(),
    cupo: evento.cupo === null ? "" : evento.cupo.toString(),
    estado: evento.estado,
    descripcion: evento.descripcion,
    publicado: evento.publicado,
    registroAbierto: evento.registroAbierto,
  };

  return (
    <LayoutAdmin titulo={`Editar: ${evento.nombre}`} usuario={usuario}>
      <FormularioEvento
        accion={actualizarEvento.bind(null, id)}
        valores={valores}
        imagenActual={evento.imagenPath}
        textoEnvio="Guardar cambios"
      />
    </LayoutAdmin>
  );
}
