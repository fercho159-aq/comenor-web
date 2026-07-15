"use client";

import { Badge, BotonAccion, TablaAdmin, type ColumnaTabla } from "@/components/admin";

import type { EventoAdmin } from "./_datos";
import {
  etiquetaEstado,
  etiquetaModalidad,
  formatearFecha,
  formatearPrecio,
} from "./_formato";

/** Acción de servidor que alterna una bandera (publicado / registroAbierto). */
type AccionBandera = (formData: FormData) => Promise<void>;

interface TablaEventosProps {
  eventos: EventoAdmin[];
  accionBandera: AccionBandera;
}

/**
 * Tabla de gestión de eventos. Usa el `TablaAdmin` del UI kit y añade, por fila,
 * las acciones que NO borran datos: publicar/despublicar y abrir/cerrar registro
 * (formularios con la Server Action `establecerBanderaEvento`), más el enlace de
 * edición.
 */
export default function TablaEventos({
  eventos,
  accionBandera,
}: TablaEventosProps) {
  const columnas: Array<ColumnaTabla<EventoAdmin>> = [
    {
      clave: "nombre",
      encabezado: "Evento",
      celda: (evento) => (
        <div className="flex flex-col">
          <BotonAccion
            href={`/admin/eventos/${evento.id}`}
            variante="sutil"
            tamano="sm"
            className="justify-start px-0 !text-verde"
          >
            {evento.nombre}
          </BotonAccion>
          <span className="text-sm text-tinta-suave">/{evento.slug}</span>
        </div>
      ),
    },
    {
      clave: "fecha",
      encabezado: "Fecha",
      celda: (evento) => formatearFecha(evento.fecha),
    },
    {
      clave: "modalidad",
      encabezado: "Modalidad",
      ocultarEnMovil: true,
      celda: (evento) => etiquetaModalidad(evento.modalidad),
    },
    {
      clave: "precio",
      encabezado: "Costo",
      alinear: "derecha",
      celda: (evento) => formatearPrecio(evento.costoCentavos),
    },
    {
      clave: "registros",
      encabezado: "Registros",
      alinear: "derecha",
      ocultarEnMovil: true,
      celda: (evento) =>
        evento.cupo === null
          ? `${evento.registrados} / ∞`
          : `${evento.registrados} / ${evento.cupo}`,
    },
    {
      clave: "estado",
      encabezado: "Estado",
      ocultarEnMovil: true,
      celda: (evento) => (
        <span className="text-sm text-tinta">
          {etiquetaEstado(evento.estado)}
        </span>
      ),
    },
    {
      clave: "publicacion",
      encabezado: "Publicación",
      celda: (evento) => (
        <div className="flex flex-col items-start gap-2">
          <Badge estado={evento.publicado ? "publicado" : "borrador"} />
          <form action={accionBandera}>
            <input type="hidden" name="id" value={evento.id} />
            <input type="hidden" name="campo" value="publicado" />
            <input
              type="hidden"
              name="valor"
              value={(!evento.publicado).toString()}
            />
            <BotonAccion
              type="submit"
              tamano="sm"
              variante={evento.publicado ? "peligro" : "primario"}
            >
              {evento.publicado ? "Despublicar" : "Publicar"}
            </BotonAccion>
          </form>
        </div>
      ),
    },
    {
      clave: "registro",
      encabezado: "Registro",
      celda: (evento) => (
        <div className="flex flex-col items-start gap-2">
          <span className="text-sm text-tinta">
            {evento.registroAbierto ? "Abierto" : "Cerrado"}
          </span>
          <form action={accionBandera}>
            <input type="hidden" name="id" value={evento.id} />
            <input type="hidden" name="campo" value="registroAbierto" />
            <input
              type="hidden"
              name="valor"
              value={(!evento.registroAbierto).toString()}
            />
            <BotonAccion
              type="submit"
              tamano="sm"
              variante="secundario"
            >
              {evento.registroAbierto ? "Cerrar registro" : "Abrir registro"}
            </BotonAccion>
          </form>
        </div>
      ),
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alinear: "derecha",
      celda: (evento) => (
        <BotonAccion
          href={`/admin/eventos/${evento.id}`}
          variante="secundario"
          tamano="sm"
        >
          Editar
        </BotonAccion>
      ),
    },
  ];

  return (
    <TablaAdmin
      columnas={columnas}
      datos={eventos}
      claveFila={(evento) => evento.id}
      descripcion="Lista de eventos del panel de administración"
      vacio="Aún no hay eventos. Crea el primero con “Nuevo evento”."
    />
  );
}
