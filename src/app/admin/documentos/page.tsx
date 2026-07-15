/**
 * /admin/documentos — Gestión documental (panel admin, PLAN A3).
 *
 * Server Component: exige rol `admin` (defensa en profundidad sobre el
 * middleware) y arma el marco `LayoutAdmin`. La carga, el listado con filtros
 * y las acciones viven en el cliente (`PanelDocumentos`), que consume los route
 * handlers de `/api/documentos`.
 */
import type { Metadata } from "next";

import { LayoutAdmin } from "@/components/admin";
import { requireRol } from "@/lib/auth/roles";
import PanelDocumentos from "./PanelDocumentos";

export const metadata: Metadata = {
  title: "Gestión documental · Admin COMENOR",
  robots: { index: false, follow: false },
};

// La sesión y los datos son por usuario: nunca cachear esta ruta.
export const dynamic = "force-dynamic";

function nombreDesde(correo: string | undefined): string {
  if (!correo) return "Administrador";
  const local = correo.split("@")[0] ?? correo;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default async function PaginaDocumentos() {
  const { user, rol } = await requireRol(["admin"], { redirigirA: "/login" });

  const metadatosUsuario = user.user_metadata as { nombre?: unknown } | null;
  const nombre =
    typeof metadatosUsuario?.nombre === "string" && metadatosUsuario.nombre
      ? metadatosUsuario.nombre
      : nombreDesde(user.email);

  return (
    <LayoutAdmin
      titulo="Gestión documental"
      usuario={{ nombre, correo: user.email ?? "", rol }}
    >
      <PanelDocumentos />
    </LayoutAdmin>
  );
}
