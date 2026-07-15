/**
 * /admin/registros/checkin — Check-in de asistentes por QR (PLAN.md §A3).
 *
 * Server Component. Solo rol admin (requireRol; el middleware admin ya protege
 * /admin). Renderiza el lector de QR (EscanerCheckin), que envía el token a
 * POST /api/checkin y muestra el veredicto verde/rojo. El panel es solo UI: la
 * regla de uso único vive en el route handler.
 */
import { BotonAccion, LayoutAdmin } from "@/components/admin";
import { requireRol } from "@/lib/auth/roles";
import EscanerCheckin from "./EscanerCheckin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Check-in por QR | Panel COMENOR",
};

export default async function CheckinPage() {
  const { user, rol } = await requireRol(["admin"], { redirigirA: "/login" });

  return (
    <LayoutAdmin
      titulo="Check-in por QR"
      usuario={{
        nombre: user.email ?? "Administrador",
        correo: user.email ?? "",
        rol,
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-cuerpo text-tinta-suave">
            Escanea el código QR de cada asistente para registrar su acceso. Cada
            código es de un solo uso: en verde si el acceso es válido, en rojo si
            ya fue utilizado o no es válido.
          </p>
          <BotonAccion href="/admin/registros" variante="secundario">
            Volver a registros
          </BotonAccion>
        </div>

        <EscanerCheckin />
      </div>
    </LayoutAdmin>
  );
}
