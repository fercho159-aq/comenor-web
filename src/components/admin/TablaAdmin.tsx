"use client";

import type { ReactNode } from "react";
import { cn } from "@/components/ui";

type Alineacion = "izquierda" | "centro" | "derecha";

export type ColumnaTabla<T> = {
  /** Clave estable de la columna (también sirve de `key` de React). */
  clave: string;
  /** Encabezado visible de la columna. */
  encabezado: ReactNode;
  /** Contenido de la celda. Recibe la fila completa. */
  celda: (fila: T) => ReactNode;
  alinear?: Alineacion;
  /** Oculta la columna en móvil (se muestra desde `sm`). */
  ocultarEnMovil?: boolean;
  className?: string;
};

export type PaginacionTabla = {
  paginaActual: number;
  totalPaginas: number;
  /** Se invoca con la nueva página (1-indexada). */
  onCambioPagina: (pagina: number) => void;
};

type TablaAdminProps<T> = {
  columnas: Array<ColumnaTabla<T>>;
  datos: ReadonlyArray<T>;
  /** Identificador estable por fila (para `key`). */
  claveFila: (fila: T) => string;
  /** Descripción accesible de la tabla (`<caption>`, visualmente oculta). */
  descripcion: string;
  /** Muestra el estado de carga en lugar de las filas. */
  cargando?: boolean;
  /** Contenido del estado vacío (por defecto, un texto neutro). */
  vacio?: ReactNode;
  paginacion?: PaginacionTabla;
  className?: string;
};

const ALINEACION: Record<Alineacion, string> = {
  izquierda: "text-left",
  centro: "text-center",
  derecha: "text-right",
};

/**
 * Tabla del panel admin. Genérica sobre el tipo de fila, con estados de carga y
 * vacío y paginación controlada. Presentacional: la carga y el paginado los
 * decide la página que la consume (server action o fetch en cliente).
 */
export default function TablaAdmin<T>({
  columnas,
  datos,
  claveFila,
  descripcion,
  cargando = false,
  vacio,
  paginacion,
  className,
}: TablaAdminProps<T>) {
  const totalColumnas = columnas.length;

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto border border-tinta-suave/20 bg-blanco">
        <table className="w-full border-collapse text-left text-cuerpo">
          <caption className="sr-only">{descripcion}</caption>
          <thead>
            <tr className="border-b border-tinta-suave/20 bg-humo">
              {columnas.map((col) => (
                <th
                  key={col.clave}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-sm font-bold text-verde",
                    ALINEACION[col.alinear ?? "izquierda"],
                    col.ocultarEnMovil && "hidden sm:table-cell",
                    col.className,
                  )}
                >
                  {col.encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody aria-busy={cargando || undefined}>
            {cargando ? (
              <tr>
                <td
                  colSpan={totalColumnas}
                  className="px-4 py-10 text-center text-tinta-suave"
                >
                  <span className="inline-flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-verde border-t-transparent"
                    />
                    Cargando…
                  </span>
                </td>
              </tr>
            ) : datos.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColumnas}
                  className="px-4 py-10 text-center text-tinta-suave"
                >
                  {vacio ?? "No hay registros para mostrar."}
                </td>
              </tr>
            ) : (
              datos.map((fila) => (
                <tr
                  key={claveFila(fila)}
                  className="border-b border-tinta-suave/15 last:border-b-0 hover:bg-humo/60"
                >
                  {columnas.map((col) => (
                    <td
                      key={col.clave}
                      className={cn(
                        "px-4 py-3 align-middle text-tinta",
                        ALINEACION[col.alinear ?? "izquierda"],
                        col.ocultarEnMovil && "hidden sm:table-cell",
                      )}
                    >
                      {col.celda(fila)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginacion && paginacion.totalPaginas > 1 ? (
        <Paginacion {...paginacion} />
      ) : null}
    </div>
  );
}

function Paginacion({
  paginaActual,
  totalPaginas,
  onCambioPagina,
}: PaginacionTabla) {
  const anterior = Math.max(1, paginaActual - 1);
  const siguiente = Math.min(totalPaginas, paginaActual + 1);

  return (
    <nav
      className="mt-4 flex items-center justify-between gap-4"
      aria-label="Paginación de la tabla"
    >
      <p className="text-sm text-tinta-suave" aria-live="polite">
        Página {paginaActual} de {totalPaginas}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onCambioPagina(anterior)}
          disabled={paginaActual <= 1}
          className={CLASES_PAGINA}
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onCambioPagina(siguiente)}
          disabled={paginaActual >= totalPaginas}
          className={CLASES_PAGINA}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}

const CLASES_PAGINA =
  "rounded-full border-2 border-verde px-4 py-1.5 text-sm font-bold text-verde " +
  "transition-colors hover:bg-verde hover:text-blanco " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-verde";
