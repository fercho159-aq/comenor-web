/**
 * /admin/memorias — listado y alta de galerías (Memorias).
 * Server Component. Protegido por el middleware admin y, además, por
 * `requireRol(["admin"])` (defensa en profundidad). Las fotos viven en un bucket
 * PRIVADO: las miniaturas se muestran con URL firmada de vida corta.
 */
import { LayoutAdmin } from "@/components/admin";
import { requireRol } from "@/lib/auth/roles";
import { urlFirmada } from "@/lib/storage/firmadas";

import FormularioGaleria from "./FormularioGaleria";
import ListaGalerias from "./ListaGalerias";
import {
  listarEventosParaAsociar,
  listarGalerias,
} from "./datos";
import { BUCKET_MEMORIAS } from "./logica";
import type { GaleriaFila, OpcionEvento } from "./tipos";

export const dynamic = "force-dynamic";

const fmtFechaEvento = new Intl.DateTimeFormat("es-MX", {
  month: "short",
  year: "numeric",
  timeZone: "America/Mexico_City",
});

async function firmarSeguro(path: string | null): Promise<string | null> {
  if (!path) return null;
  try {
    return await urlFirmada(BUCKET_MEMORIAS, path, 300);
  } catch {
    return null;
  }
}

export default async function MemoriasPage() {
  const { user } = await requireRol(["admin"], { redirigirA: "/login" });
  const usuario = {
    nombre: user.email ?? "Administrador",
    correo: user.email ?? "",
    rol: "admin" as const,
  };

  const [galerias, eventos] = await Promise.all([
    listarGalerias(),
    listarEventosParaAsociar(),
  ]);

  const filas: GaleriaFila[] = await Promise.all(
    galerias.map(async (g) => ({
      id: g.id,
      titulo: g.titulo,
      anio: g.anio,
      publicada: g.publicada,
      totalFotos: g.totalFotos,
      eventoNombre: null,
      portadaUrl: await firmarSeguro(g.portada),
    })),
  );

  const opcionesEvento: OpcionEvento[] = eventos.map((e) => ({
    id: e.id,
    etiqueta: `${e.nombre} · ${fmtFechaEvento.format(e.fecha)}`,
  }));

  return (
    <LayoutAdmin titulo="Memorias" usuario={usuario}>
      <div className="flex flex-col gap-8">
        <section aria-labelledby="alta-galeria">
          <h2
            id="alta-galeria"
            className="mb-4 text-titulo font-bold text-verde"
          >
            Nueva galería
          </h2>
          <FormularioGaleria opcionesEvento={opcionesEvento} />
        </section>

        <section aria-labelledby="lista-galerias">
          <h2
            id="lista-galerias"
            className="mb-4 text-titulo font-bold text-verde"
          >
            Galerías ({filas.length})
          </h2>
          <ListaGalerias datos={filas} />
        </section>
      </div>
    </LayoutAdmin>
  );
}
