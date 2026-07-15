"use client";

import { Badge, BotonAccion, TablaAdmin, type ColumnaTabla } from "@/components/admin";

import type { GaleriaFila } from "./tipos";

type Props = { datos: GaleriaFila[] };

/**
 * Listado de galerías con el UI kit admin. Recibe datos ya serializados desde el
 * server component (incluidas las URL firmadas de portada). Las columnas se
 * definen aquí porque `TablaAdmin` es un componente cliente.
 *
 * Las miniaturas usan `<img>` (no `next/image`) porque son URL firmadas de vida
 * corta de un bucket privado, no cubiertas por remotePatterns.
 */
export default function ListaGalerias({ datos }: Props) {
  const columnas: Array<ColumnaTabla<GaleriaFila>> = [
    {
      clave: "portada",
      encabezado: "Portada",
      celda: (g) =>
        g.portadaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL firmada efímera de bucket privado
          <img
            src={g.portadaUrl}
            alt={`Portada de ${g.titulo}`}
            width={64}
            height={48}
            className="h-12 w-16 rounded object-cover"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-12 w-16 items-center justify-center rounded bg-humo text-xs text-tinta-suave"
          >
            —
          </div>
        ),
    },
    {
      clave: "titulo",
      encabezado: "Título",
      celda: (g) => <span className="font-bold text-tinta">{g.titulo}</span>,
    },
    {
      clave: "anio",
      encabezado: "Año",
      alinear: "centro",
      celda: (g) => g.anio,
    },
    {
      clave: "fotos",
      encabezado: "Fotos",
      alinear: "centro",
      ocultarEnMovil: true,
      celda: (g) => g.totalFotos,
    },
    {
      clave: "estado",
      encabezado: "Estado",
      alinear: "centro",
      celda: (g) => (
        <Badge estado={g.publicada ? "publicado" : "borrador"} />
      ),
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alinear: "derecha",
      celda: (g) => (
        <BotonAccion
          href={`/admin/memorias/${g.id}`}
          variante="secundario"
          tamano="sm"
        >
          Gestionar
        </BotonAccion>
      ),
    },
  ];

  return (
    <TablaAdmin
      columnas={columnas}
      datos={datos}
      claveFila={(g) => g.id}
      descripcion="Listado de galerías de memorias con su portada, año, número de fotos y estado de publicación."
      vacio="Aún no hay galerías. Crea la primera con el formulario de arriba."
    />
  );
}
