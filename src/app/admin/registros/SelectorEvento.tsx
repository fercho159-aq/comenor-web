"use client";

import { useRouter } from "next/navigation";

import { CampoFormulario } from "@/components/admin";
import { formatearFecha } from "./_formato";

export interface OpcionEvento {
  id: string;
  nombre: string;
  fecha: string;
}

interface Props {
  eventos: ReadonlyArray<OpcionEvento>;
  seleccionado?: string;
}

const CLASES_SELECT =
  "w-full max-w-xl border border-tinta-suave/40 bg-blanco px-4 py-2.5 " +
  "text-cuerpo text-tinta focus-visible:border-verde";

/**
 * Selector de evento del panel de registros. Al elegir un evento navega a
 * `/admin/registros?evento=<id>` para que el Server Component cargue sus
 * registros. Funciona con teclado y anuncia la etiqueta al lector de pantalla.
 */
export default function SelectorEvento({ eventos, seleccionado }: Props) {
  const router = useRouter();

  return (
    <CampoFormulario etiqueta="Evento" className="max-w-xl">
      {(control) => (
        <select
          {...control}
          className={CLASES_SELECT}
          value={seleccionado ?? ""}
          onChange={(e) => {
            const id = e.target.value;
            router.push(id ? `/admin/registros?evento=${id}` : "/admin/registros");
          }}
        >
          <option value="">Selecciona un evento…</option>
          {eventos.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.nombre} — {formatearFecha(ev.fecha)}
            </option>
          ))}
        </select>
      )}
    </CampoFormulario>
  );
}
