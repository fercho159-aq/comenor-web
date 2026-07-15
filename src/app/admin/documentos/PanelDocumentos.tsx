"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { BotonAccion, TablaAdmin, type ColumnaTabla } from "@/components/admin";
import { cn } from "@/components/ui";
import { esNivelAcceso, type NivelAcceso } from "@/lib/documentos/acceso";
import { nivelesAcceso } from "@/lib/schemas/documento";
import CargaDocumento from "./CargaDocumento";
import PillNivel from "./PillNivel";
import { MESES, etiquetaNivel, periodoLegible } from "./_formato";
import type { DocumentoListado, ErrorApi } from "./_tipos";

const POR_PAGINA = 10;
const TODOS = "todos";

/** Convierte la respuesta cruda del API en filas tipadas y saneadas. */
function normalizar(datos: unknown): DocumentoListado[] {
  if (typeof datos !== "object" || datos === null) return [];
  const lista = (datos as { documentos?: unknown }).documentos;
  if (!Array.isArray(lista)) return [];
  const filas: DocumentoListado[] = [];
  for (const item of lista) {
    if (typeof item !== "object" || item === null) continue;
    const f = item as Record<string, unknown>;
    if (
      typeof f.id === "string" &&
      typeof f.titulo === "string" &&
      typeof f.mes === "number" &&
      typeof f.anio === "number" &&
      esNivelAcceso(f.nivelAcceso) &&
      typeof f.tipo === "string" &&
      typeof f.formato === "string"
    ) {
      filas.push({
        id: f.id,
        titulo: f.titulo,
        mes: f.mes,
        anio: f.anio,
        nivelAcceso: f.nivelAcceso,
        tipo: f.tipo,
        formato: f.formato,
        createdAt: typeof f.createdAt === "string" ? f.createdAt : "",
      });
    }
  }
  return filas;
}

export default function PanelDocumentos() {
  const [documentos, setDocumentos] = useState<DocumentoListado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [abriendo, setAbriendo] = useState<string | undefined>();

  // Filtros
  const [texto, setTexto] = useState("");
  const [anioFiltro, setAnioFiltro] = useState<string>(TODOS);
  const [mesFiltro, setMesFiltro] = useState<string>(TODOS);
  const [nivelFiltro, setNivelFiltro] = useState<string>(TODOS);
  const [pagina, setPagina] = useState(1);

  const idBusqueda = useId();

  // Fetch PURO (sin setState): reutilizable por el efecto de montaje y por el
  // botón "Actualizar". Lanza Error con mensaje legible si algo falla.
  const obtenerDocumentos = useCallback(async (): Promise<DocumentoListado[]> => {
    let respuesta: Response;
    try {
      respuesta = await fetch("/api/documentos", { cache: "no-store" });
    } catch {
      throw new Error("No se pudo conectar con el servidor.");
    }
    if (!respuesta.ok) {
      const cuerpo = (await respuesta.json().catch(() => ({}))) as ErrorApi;
      throw new Error(cuerpo.mensaje ?? "No se pudieron cargar los documentos.");
    }
    return normalizar(await respuesta.json());
  }, []);

  // Recarga desde un manejador de eventos (setState permitido aquí).
  const recargar = useCallback(async () => {
    setCargando(true);
    setError(undefined);
    try {
      setDocumentos(await obtenerDocumentos());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los documentos.");
      setDocumentos([]);
    } finally {
      setCargando(false);
    }
  }, [obtenerDocumentos]);

  // Carga inicial: el setState vive dentro del IIFE async del efecto.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const filas = await obtenerDocumentos();
        if (!cancelado) setDocumentos(filas);
      } catch (e) {
        if (!cancelado) {
          setError(
            e instanceof Error ? e.message : "No se pudieron cargar los documentos.",
          );
          setDocumentos([]);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [obtenerDocumentos]);

  // Años presentes en los datos, para poblar el filtro.
  const aniosPresentes = useMemo(() => {
    const set = new Set<number>();
    for (const doc of documentos) set.add(doc.anio);
    return [...set].sort((a, b) => b - a);
  }, [documentos]);

  const filtrados = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return documentos.filter((doc) => {
      if (anioFiltro !== TODOS && doc.anio !== Number(anioFiltro)) return false;
      if (mesFiltro !== TODOS && doc.mes !== Number(mesFiltro)) return false;
      if (nivelFiltro !== TODOS && doc.nivelAcceso !== nivelFiltro) return false;
      if (
        q &&
        !doc.titulo.toLowerCase().includes(q) &&
        !doc.tipo.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [documentos, texto, anioFiltro, mesFiltro, nivelFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA,
  );

  // Cambiar un filtro también reinicia la paginación (en el manejador, no en un
  // efecto: evita renders en cascada y mantiene la página válida al filtrar).
  function cambiarTexto(valor: string) {
    setTexto(valor);
    setPagina(1);
  }
  function cambiarAnio(valor: string) {
    setAnioFiltro(valor);
    setPagina(1);
  }
  function cambiarMes(valor: string) {
    setMesFiltro(valor);
    setPagina(1);
  }
  function cambiarNivel(valor: string) {
    setNivelFiltro(valor);
    setPagina(1);
  }

  async function abrirDocumento(id: string) {
    setAbriendo(id);
    setError(undefined);
    try {
      const respuesta = await fetch(`/api/documentos/${id}/url-firmada`, {
        cache: "no-store",
      });
      if (!respuesta.ok) {
        const cuerpo = (await respuesta.json().catch(() => ({}))) as ErrorApi;
        setError(cuerpo.mensaje ?? "No se pudo abrir el documento.");
        return;
      }
      const { url } = (await respuesta.json()) as { url?: string };
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("No se pudo abrir el documento.");
    } finally {
      setAbriendo(undefined);
    }
  }

  const columnas: Array<ColumnaTabla<DocumentoListado>> = [
    {
      clave: "titulo",
      encabezado: "Título",
      celda: (d) => (
        <span className="font-bold text-tinta">{d.titulo}</span>
      ),
    },
    {
      clave: "tipo",
      encabezado: "Tipo",
      ocultarEnMovil: true,
      celda: (d) => d.tipo,
    },
    {
      clave: "periodo",
      encabezado: "Período",
      celda: (d) => periodoLegible(d.mes, d.anio),
    },
    {
      clave: "nivel",
      encabezado: "Nivel",
      celda: (d) => <PillNivel nivel={d.nivelAcceso} />,
    },
    {
      clave: "formato",
      encabezado: "Formato",
      ocultarEnMovil: true,
      celda: (d) => (
        <span className="uppercase text-tinta-suave">{d.formato}</span>
      ),
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alinear: "derecha",
      celda: (d) => (
        <div className="flex justify-end gap-2">
          <BotonAccion
            variante="secundario"
            tamano="sm"
            cargando={abriendo === d.id}
            onClick={() => void abrirDocumento(d.id)}
          >
            Ver
          </BotonAccion>
          <BotonAccion
            href={`/admin/documentos/${d.id}?titulo=${encodeURIComponent(d.titulo)}`}
            variante="sutil"
            tamano="sm"
          >
            Editar contenido
          </BotonAccion>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <CargaDocumento onCreado={recargar} />

      <section aria-labelledby="titulo-listado" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-listado" className="text-titulo font-bold text-verde">
            Documentos
          </h2>
          <BotonAccion
            variante="secundario"
            tamano="sm"
            cargando={cargando}
            onClick={() => void recargar()}
          >
            Actualizar
          </BotonAccion>
        </div>

        {/* Filtros */}
        <div className="grid gap-3 border border-tinta-suave/20 bg-blanco p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={idBusqueda} className="text-sm font-bold text-verde">
              Buscar
            </label>
            <input
              id={idBusqueda}
              type="search"
              value={texto}
              onChange={(e) => cambiarTexto(e.target.value)}
              placeholder="Título o tipo…"
              className={CLASES_FILTRO}
            />
          </div>

          <FiltroSelect
            etiqueta="Año"
            valor={anioFiltro}
            onCambio={cambiarAnio}
            opciones={[
              { valor: TODOS, nombre: "Todos" },
              ...aniosPresentes.map((a) => ({ valor: String(a), nombre: String(a) })),
            ]}
          />
          <FiltroSelect
            etiqueta="Mes"
            valor={mesFiltro}
            onCambio={cambiarMes}
            opciones={[
              { valor: TODOS, nombre: "Todos" },
              ...MESES.map((m) => ({ valor: String(m.valor), nombre: m.nombre })),
            ]}
          />
          <FiltroSelect
            etiqueta="Nivel de acceso"
            valor={nivelFiltro}
            onCambio={cambiarNivel}
            opciones={[
              { valor: TODOS, nombre: "Todos" },
              ...nivelesAcceso.map((n: NivelAcceso) => ({
                valor: n,
                nombre: etiquetaNivel(n),
              })),
            ]}
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm font-bold text-vino">
            {error}
          </p>
        ) : null}

        <p className="text-sm text-tinta-suave" aria-live="polite">
          {cargando
            ? "Cargando documentos…"
            : `${filtrados.length} documento(s)` +
              (filtrados.length !== documentos.length
                ? ` de ${documentos.length}`
                : "")}
        </p>

        <TablaAdmin
          columnas={columnas}
          datos={visibles}
          claveFila={(d) => d.id}
          descripcion="Listado de documentos con período, nivel de acceso y acciones."
          cargando={cargando}
          vacio={
            documentos.length === 0
              ? "Aún no hay documentos cargados."
              : "Ningún documento coincide con los filtros."
          }
          paginacion={{
            paginaActual: paginaSegura,
            totalPaginas,
            onCambioPagina: setPagina,
          }}
        />
      </section>
    </div>
  );
}

const CLASES_FILTRO =
  "w-full border border-tinta-suave/40 bg-blanco px-3 py-2 text-cuerpo " +
  "text-tinta placeholder:text-tinta-suave/70 focus-visible:border-verde";

function FiltroSelect({
  etiqueta,
  valor,
  onCambio,
  opciones,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  opciones: ReadonlyArray<{ valor: string; nombre: string }>;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-verde">
        {etiqueta}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className={cn(CLASES_FILTRO)}
      >
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
