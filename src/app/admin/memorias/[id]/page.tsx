/**
 * /admin/memorias/[id] — gestión de una galería: metadatos, carga de fotos,
 * portada y orden. Server Component protegido por `requireRol(["admin"])`.
 */
import { notFound } from "next/navigation";

import { BotonAccion, LayoutAdmin } from "@/components/admin";
import { requireRol } from "@/lib/auth/roles";
import { urlFirmada } from "@/lib/storage/firmadas";

import BotonEliminarGaleria from "../BotonEliminarGaleria";
import FormularioGaleria from "../FormularioGaleria";
import GestorFotos from "../GestorFotos";
import {
  listarEventosParaAsociar,
  listarFotos,
  obtenerGaleria,
} from "../datos";
import { BUCKET_MEMORIAS } from "../logica";
import type { FotoFila, OpcionEvento } from "../tipos";

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

type Params = { params: Promise<{ id: string }> };

export default async function GaleriaDetallePage({ params }: Params) {
  const { id } = await params;
  const { user } = await requireRol(["admin"], { redirigirA: "/login" });
  const usuario = {
    nombre: user.email ?? "Administrador",
    correo: user.email ?? "",
    rol: "admin" as const,
  };

  const galeria = await obtenerGaleria(id);
  if (!galeria) notFound();

  const [fotos, eventos] = await Promise.all([
    listarFotos(id),
    listarEventosParaAsociar(),
  ]);

  const fotosFila: FotoFila[] = await Promise.all(
    fotos.map(async (f) => ({
      id: f.id,
      storagePath: f.storagePath,
      orden: f.orden,
      esPortada: galeria.portada === f.storagePath,
      url: await firmarSeguro(f.storagePath),
    })),
  );

  const opcionesEvento: OpcionEvento[] = eventos.map((e) => ({
    id: e.id,
    etiqueta: `${e.nombre} · ${fmtFechaEvento.format(e.fecha)}`,
  }));

  return (
    <LayoutAdmin titulo={`Memorias · ${galeria.titulo}`} usuario={usuario}>
      <div className="flex flex-col gap-8">
        <div>
          <BotonAccion href="/admin/memorias" variante="sutil" tamano="sm">
            ← Volver a galerías
          </BotonAccion>
        </div>

        <section aria-labelledby="datos-galeria">
          <h2
            id="datos-galeria"
            className="mb-4 text-titulo font-bold text-verde"
          >
            Datos de la galería
          </h2>
          <FormularioGaleria
            opcionesEvento={opcionesEvento}
            galeria={{
              id: galeria.id,
              titulo: galeria.titulo,
              anio: galeria.anio,
              eventoId: galeria.eventoId,
              publicada: galeria.publicada,
            }}
          />
        </section>

        <section aria-labelledby="fotos-galeria">
          <h2
            id="fotos-galeria"
            className="mb-4 text-titulo font-bold text-verde"
          >
            Fotos ({fotosFila.length})
          </h2>
          <GestorFotos galeriaId={galeria.id} fotos={fotosFila} />
        </section>

        <section
          aria-labelledby="zona-peligro"
          className="border border-vino/30 bg-blanco p-6"
        >
          <h2
            id="zona-peligro"
            className="mb-2 text-titulo font-bold text-vino"
          >
            Eliminar galería
          </h2>
          <p className="mb-4 text-cuerpo text-tinta-suave">
            Esta acción borra la galería y todas sus fotos de forma permanente.
          </p>
          <BotonEliminarGaleria galeriaId={galeria.id} />
        </section>
      </div>
    </LayoutAdmin>
  );
}
