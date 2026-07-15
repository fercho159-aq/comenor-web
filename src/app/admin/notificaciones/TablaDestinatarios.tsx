"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  Badge,
  BotonAccion,
  TablaAdmin,
  type ColumnaTabla,
} from "@/components/admin";

import { alternarActivo, eliminarDestinatario } from "./actions";
import { perfilesDestinatario } from "./schemas";

type DestinatarioFila = {
  id: string;
  correo: string;
  perfil: (typeof perfilesDestinatario)[number];
  activo: boolean;
};

const ETIQUETA_PERFIL: Record<DestinatarioFila["perfil"], string> = {
  consejo: "Consejo",
  asociados: "Asociados",
  admin: "Administrador",
};

type Aviso = { tipo: "ok" | "error"; texto: string } | null;

/** Tabla de destinatarios con acciones de baja/alta y eliminación por fila. */
export default function TablaDestinatarios({
  datos,
}: {
  datos: DestinatarioFila[];
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<Aviso>(null);

  const anunciar = (r: { ok: boolean; mensaje: string }) =>
    setAviso({ tipo: r.ok ? "ok" : "error", texto: r.mensaje });

  const onAlternar = (fila: DestinatarioFila) => {
    iniciar(async () => {
      const r = await alternarActivo(fila.id, !fila.activo);
      anunciar(r);
      if (r.ok) router.refresh();
    });
  };

  const onEliminar = (fila: DestinatarioFila) => {
    const ok = window.confirm(`¿Eliminar a ${fila.correo} de la lista?`);
    if (!ok) return;
    iniciar(async () => {
      const r = await eliminarDestinatario(fila.id);
      anunciar(r);
      if (r.ok) router.refresh();
    });
  };

  const columnas: Array<ColumnaTabla<DestinatarioFila>> = [
    {
      clave: "correo",
      encabezado: "Correo",
      celda: (d) => <span className="font-bold text-tinta">{d.correo}</span>,
    },
    {
      clave: "perfil",
      encabezado: "Perfil",
      celda: (d) => ETIQUETA_PERFIL[d.perfil],
    },
    {
      clave: "estado",
      encabezado: "Estado",
      alinear: "centro",
      celda: (d) => (
        <Badge estado={d.activo ? "publicado" : "borrador"}>
          {d.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alinear: "derecha",
      celda: (d) => (
        <div className="flex flex-wrap justify-end gap-2">
          <BotonAccion
            variante="secundario"
            tamano="sm"
            onClick={() => onAlternar(d)}
            disabled={pendiente}
          >
            {d.activo ? "Dar de baja" : "Activar"}
          </BotonAccion>
          <BotonAccion
            variante="peligro"
            tamano="sm"
            onClick={() => onEliminar(d)}
            disabled={pendiente}
          >
            Eliminar
          </BotonAccion>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <TablaAdmin
        columnas={columnas}
        datos={datos}
        claveFila={(d) => d.id}
        descripcion="Listado de destinatarios de notificaciones con su perfil y estado, y acciones para darlos de baja o eliminarlos."
        vacio="Aún no hay destinatarios. Agrega el primero con el formulario de arriba."
      />
      <p
        role="status"
        aria-live="polite"
        className={
          aviso
            ? aviso.tipo === "ok"
              ? "text-sm font-bold text-verde"
              : "text-sm font-bold text-vino"
            : "sr-only"
        }
      >
        {aviso?.texto}
      </p>
    </div>
  );
}
