/**
 * /admin/notificaciones — gestión de destinatarios de notificaciones
 * documentales (email_recipients): alta/baja, perfil y estado activo.
 *
 * Estos destinatarios son a quienes `POST /api/notificaciones/documento`
 * envía el aviso cuando se publica un documento (filtrando por perfil según el
 * nivel de acceso). Server Component protegido por `requireRol(["admin"])`.
 */
import { LayoutAdmin } from "@/components/admin";
import { requireRol } from "@/lib/auth/roles";

import FormularioDestinatario from "./FormularioDestinatario";
import TablaDestinatarios from "./TablaDestinatarios";
import { listarDestinatarios } from "./datos";

export const dynamic = "force-dynamic";

export default async function NotificacionesPage() {
  const { user } = await requireRol(["admin"], { redirigirA: "/login" });
  const usuario = {
    nombre: user.email ?? "Administrador",
    correo: user.email ?? "",
    rol: "admin" as const,
  };

  const destinatarios = await listarDestinatarios();
  const activos = destinatarios.filter((d) => d.activo).length;

  return (
    <LayoutAdmin titulo="Destinatarios de notificaciones" usuario={usuario}>
      <div className="flex flex-col gap-8">
        <p className="max-w-2xl text-cuerpo text-tinta-suave">
          Estas personas reciben un correo cuando se publica un documento. El
          aviso se filtra por perfil según el nivel de acceso del documento:
          los de perfil <strong>Asociados</strong> reciben avisos públicos y de
          asociados; los de <strong>Consejo</strong>, todos.
        </p>

        <section aria-labelledby="alta-destinatario">
          <h2
            id="alta-destinatario"
            className="mb-4 text-titulo font-bold text-verde"
          >
            Agregar destinatario
          </h2>
          <FormularioDestinatario />
        </section>

        <section aria-labelledby="lista-destinatarios">
          <h2
            id="lista-destinatarios"
            className="mb-4 text-titulo font-bold text-verde"
          >
            Destinatarios ({destinatarios.length} · {activos} activos)
          </h2>
          <TablaDestinatarios
            datos={destinatarios.map((d) => ({
              id: d.id,
              correo: d.correo,
              perfil: d.perfil,
              activo: d.activo,
            }))}
          />
        </section>
      </div>
    </LayoutAdmin>
  );
}
