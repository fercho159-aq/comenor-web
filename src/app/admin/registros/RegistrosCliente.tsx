"use client";

import { useMemo, useState } from "react";

import {
  Badge,
  BotonAccion,
  CampoFormulario,
  TablaAdmin,
  type ColumnaTabla,
  type EstadoBadge,
} from "@/components/admin";
import { formatearFechaHora } from "./_formato";
import type { RegistroFila } from "./_datos";

/** Serialización que llega del Server Component (fechas como ISO string). */
export interface RegistroSerializado
  extends Omit<RegistroFila, "checkedInAt" | "createdAt"> {
  checkedInAt: string | null;
  createdAt: string;
}

type FiltroEstado = "todos" | RegistroSerializado["estadoPago"];
type FiltroCheckin = "todos" | "ingresado" | "pendiente";

interface Props {
  eventId: string;
  eventoNombre: string;
  registros: ReadonlyArray<RegistroSerializado>;
}

const POR_PAGINA = 20;

const OPCIONES_ESTADO: ReadonlyArray<{ valor: FiltroEstado; texto: string }> = [
  { valor: "todos", texto: "Todos los pagos" },
  { valor: "gratuito", texto: "Gratuito" },
  { valor: "pendiente", texto: "Pendiente" },
  { valor: "aprobado", texto: "Aprobado" },
  { valor: "rechazado", texto: "Rechazado" },
];

const OPCIONES_CHECKIN: ReadonlyArray<{ valor: FiltroCheckin; texto: string }> =
  [
    { valor: "todos", texto: "Con o sin check-in" },
    { valor: "ingresado", texto: "Ya ingresó" },
    { valor: "pendiente", texto: "Sin check-in" },
  ];

const CLASES_SELECT =
  "w-full border border-tinta-suave/40 bg-blanco px-4 py-2.5 text-cuerpo " +
  "text-tinta focus-visible:border-verde";

export default function RegistrosCliente({
  eventId,
  eventoNombre,
  registros,
}: Props) {
  const [estado, setEstado] = useState<FiltroEstado>("todos");
  const [checkin, setCheckin] = useState<FiltroCheckin>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return registros.filter((r) => {
      if (estado !== "todos" && r.estadoPago !== estado) return false;
      if (checkin === "ingresado" && r.checkedInAt === null) return false;
      if (checkin === "pendiente" && r.checkedInAt !== null) return false;
      if (termino) {
        const heno = `${r.nombre} ${r.correo} ${r.organismo} ${r.cargo}`
          .toLowerCase();
        if (!heno.includes(termino)) return false;
      }
      return true;
    });
  }, [registros, estado, checkin, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA,
  );

  // Al cambiar un filtro, volvemos a la primera página.
  const alFiltrar = <T,>(setter: (valor: T) => void) => {
    return (valor: T) => {
      setter(valor);
      setPagina(1);
    };
  };

  const ingresados = registros.filter((r) => r.checkedInAt !== null).length;

  const columnas: Array<ColumnaTabla<RegistroSerializado>> = [
    {
      clave: "asistente",
      encabezado: "Asistente",
      celda: (r) => (
        <div className="flex flex-col">
          <span className="font-bold text-tinta">{r.nombre}</span>
          <span className="text-sm text-tinta-suave">{r.cargo}</span>
        </div>
      ),
    },
    {
      clave: "organismo",
      encabezado: "Organismo",
      ocultarEnMovil: true,
      celda: (r) => r.organismo,
    },
    {
      clave: "correo",
      encabezado: "Contacto",
      ocultarEnMovil: true,
      celda: (r) => (
        <div className="flex flex-col text-sm">
          <a
            href={`mailto:${r.correo}`}
            className="text-verde underline-offset-2 hover:underline"
          >
            {r.correo}
          </a>
          <span className="text-tinta-suave">{r.celular}</span>
        </div>
      ),
    },
    {
      clave: "pago",
      encabezado: "Pago",
      alinear: "centro",
      celda: (r) => <Badge estado={r.estadoPago as EstadoBadge} />,
    },
    {
      clave: "checkin",
      encabezado: "Check-in",
      alinear: "centro",
      celda: (r) =>
        r.checkedInAt ? (
          <span className="inline-flex flex-col items-center gap-0.5">
            <span className="inline-flex items-center rounded-full bg-verde px-3 py-1 text-xs font-bold uppercase tracking-wide text-blanco">
              Ingresó
            </span>
            <span className="text-xs text-tinta-suave">
              {formatearFechaHora(r.checkedInAt)}
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-tinta-suave/50 bg-transparent px-3 py-1 text-xs font-bold uppercase tracking-wide text-tinta-suave">
            Pendiente
          </span>
        ),
    },
  ];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-tinta-suave">
            Registros del evento
          </p>
          <h2 className="text-titulo font-bold text-verde">{eventoNombre}</h2>
          <p className="mt-1 text-sm text-tinta-suave" aria-live="polite">
            {registros.length}{" "}
            {registros.length === 1 ? "registro" : "registros"} · {ingresados}{" "}
            con check-in · {filtrados.length} visibles con los filtros actuales
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BotonAccion href="/admin/registros/checkin" variante="secundario">
            Abrir check-in por QR
          </BotonAccion>
          <BotonAccion
            href={`/api/registros/${eventId}/export`}
            variante="primario"
            // Descarga directa del .xlsx que sirve el route handler.
            download
          >
            Exportar a Excel
          </BotonAccion>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid gap-4 border border-tinta-suave/20 bg-blanco p-4 sm:grid-cols-3">
        <CampoFormulario
          etiqueta="Buscar"
          type="search"
          inputMode="search"
          placeholder="Nombre, correo u organismo"
          value={busqueda}
          onChange={(e) => alFiltrar(setBusqueda)(e.target.value)}
        />
        <CampoFormulario etiqueta="Estado de pago">
          {(control) => (
            <select
              {...control}
              className={CLASES_SELECT}
              value={estado}
              onChange={(e) =>
                alFiltrar(setEstado)(e.target.value as FiltroEstado)
              }
            >
              {OPCIONES_ESTADO.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.texto}
                </option>
              ))}
            </select>
          )}
        </CampoFormulario>
        <CampoFormulario etiqueta="Check-in">
          {(control) => (
            <select
              {...control}
              className={CLASES_SELECT}
              value={checkin}
              onChange={(e) =>
                alFiltrar(setCheckin)(e.target.value as FiltroCheckin)
              }
            >
              {OPCIONES_CHECKIN.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.texto}
                </option>
              ))}
            </select>
          )}
        </CampoFormulario>
      </div>

      <TablaAdmin
        columnas={columnas}
        datos={visibles}
        claveFila={(r) => r.id}
        descripcion={`Registros del evento ${eventoNombre}`}
        vacio={
          registros.length === 0
            ? "Este evento aún no tiene registros."
            : "Ningún registro coincide con los filtros."
        }
        paginacion={{
          paginaActual: paginaSegura,
          totalPaginas,
          onCambioPagina: setPagina,
        }}
      />
    </section>
  );
}
