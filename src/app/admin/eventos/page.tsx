/**
 * Panel admin · Eventos (listado + gestión).
 *
 * Server Component. La autorización real la impone el middleware de roles y aquí
 * se re-exige `admin` (defensa en profundidad) con redirección a /login.
 */
import { BotonAccion, LayoutAdmin } from "@/components/admin";
import { requireRol } from "@/lib/auth/roles";

import { establecerBanderaEvento } from "./acciones";
import { listarEventosAdmin } from "./_datos";
import { nombrePanel } from "./_usuario";
import TablaEventos from "./TablaEventos";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventos · Panel COMENOR",
};

export default async function PaginaEventosAdmin() {
  const { user, rol } = await requireRol(["admin"], { redirigirA: "/login" });
  const eventos = await listarEventosAdmin();

  const usuario = {
    nombre: nombrePanel(user),
    correo: user.email ?? "",
    rol,
  };

  return (
    <LayoutAdmin titulo="Eventos" usuario={usuario}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-tinta-suave">
          Gestiona los eventos del calendario: crea, edita, publica y abre o
          cierra el registro sin perder inscripciones.
        </p>
        <BotonAccion href="/admin/eventos/nuevo">Nuevo evento</BotonAccion>
      </div>

      <TablaEventos eventos={eventos} accionBandera={establecerBanderaEvento} />
    </LayoutAdmin>
  );
}
