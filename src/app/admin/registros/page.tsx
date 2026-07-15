/**
 * /admin/registros — Registros por evento (PLAN.md §A3).
 *
 * Server Component. Solo rol admin (requireRol; el middleware admin ya protege
 * /admin, aquí reforzamos y obtenemos el usuario para el guard visual). Elige un
 * evento y lista sus registros con filtros (RegistrosCliente) y botón de export
 * al route handler .xlsx. No duplica lógica de negocio: solo lee para pintar.
 */
import { LayoutAdmin } from "@/components/admin";
import { requireRol } from "@/lib/auth/roles";
import {
  buscarEvento,
  listarEventos,
  listarRegistrosDeEvento,
} from "./_datos";
import RegistrosCliente, {
  type RegistroSerializado,
} from "./RegistrosCliente";
import SelectorEvento, { type OpcionEvento } from "./SelectorEvento";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Registros | Panel COMENOR",
};

interface PageProps {
  searchParams: Promise<{ evento?: string }>;
}

export default async function RegistrosPage({ searchParams }: PageProps) {
  const { user, rol } = await requireRol(["admin"], { redirigirA: "/login" });
  const { evento: eventoId } = await searchParams;

  const eventos = await listarEventos();
  const opciones: OpcionEvento[] = eventos.map((ev) => ({
    id: ev.id,
    nombre: ev.nombre,
    fecha: ev.fecha.toISOString(),
  }));

  const eventoActual = eventoId ? await buscarEvento(eventoId) : null;
  const registros: RegistroSerializado[] = eventoActual
    ? (await listarRegistrosDeEvento(eventoActual.id)).map((r) => ({
        ...r,
        checkedInAt: r.checkedInAt ? r.checkedInAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
      }))
    : [];

  return (
    <LayoutAdmin
      titulo="Registros"
      usuario={{
        nombre: user.email ?? "Administrador",
        correo: user.email ?? "",
        rol,
      }}
    >
      <div className="flex flex-col gap-6">
        <SelectorEvento eventos={opciones} seleccionado={eventoActual?.id} />

        {eventoActual ? (
          <RegistrosCliente
            eventId={eventoActual.id}
            eventoNombre={eventoActual.nombre}
            registros={registros}
          />
        ) : (
          <p className="border border-tinta-suave/20 bg-blanco px-6 py-10 text-center text-tinta-suave">
            {eventos.length === 0
              ? "Aún no hay eventos creados."
              : "Selecciona un evento para ver y exportar sus registros."}
          </p>
        )}
      </div>
    </LayoutAdmin>
  );
}
