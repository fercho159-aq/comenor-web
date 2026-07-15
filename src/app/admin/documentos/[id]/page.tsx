/**
 * /admin/documentos/[id] — Editor de contenido (richtext) de un documento.
 *
 * Server Component: exige rol `admin` o `consejo` (mismo permiso que POST
 * /api/documentos/[id]/versiones) y arma el `LayoutAdmin`. La edición Tiptap
 * con guardado automático y el historial de versiones viven en el cliente
 * (`EditorVersiones`), que consume `/api/documentos/[id]/versiones`.
 */
import type { Metadata } from "next";

import { BotonAccion, LayoutAdmin } from "@/components/admin";
import { requireRol } from "@/lib/auth/roles";
import EditorVersiones from "./EditorVersiones";

export const metadata: Metadata = {
  title: "Editor de documento · Admin COMENOR",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function nombreDesde(correo: string | undefined): string {
  if (!correo) return "Administrador";
  const local = correo.split("@")[0] ?? correo;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default async function PaginaEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ titulo?: string }>;
}) {
  const { user, rol } = await requireRol(["admin", "consejo"], {
    redirigirA: "/login",
  });
  const { id } = await params;
  const { titulo } = await searchParams;

  const metadatosUsuario = user.user_metadata as { nombre?: unknown } | null;
  const nombre =
    typeof metadatosUsuario?.nombre === "string" && metadatosUsuario.nombre
      ? metadatosUsuario.nombre
      : nombreDesde(user.email);

  // `titulo` viene por query solo para mostrar; el dato de verdad vive en la BD.
  const encabezado = titulo?.trim() ? titulo : "Documento";

  return (
    <LayoutAdmin
      titulo="Editor de contenido"
      usuario={{ nombre, correo: user.email ?? "", rol }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.08em] text-tinta-suave">
            Documento
          </p>
          <h2 className="text-titulo font-bold text-verde">{encabezado}</h2>
        </div>
        <BotonAccion href="/admin/documentos" variante="secundario" tamano="sm">
          Volver al listado
        </BotonAccion>
      </div>

      <EditorVersiones documentId={id} />
    </LayoutAdmin>
  );
}
