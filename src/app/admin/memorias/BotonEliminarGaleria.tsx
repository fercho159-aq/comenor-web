"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { BotonAccion } from "@/components/admin";

import { eliminarGaleria } from "./actions";

/** Botón destructivo con confirmación para eliminar una galería completa. */
export default function BotonEliminarGaleria({
  galeriaId,
}: {
  galeriaId: string;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onEliminar = () => {
    const ok = window.confirm(
      "¿Eliminar esta galería y todas sus fotos? Esta acción no se puede deshacer.",
    );
    if (!ok) return;
    setError(null);
    iniciar(async () => {
      const r = await eliminarGaleria(galeriaId);
      if (r.ok) {
        router.push("/admin/memorias");
        router.refresh();
      } else {
        setError(r.mensaje);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <BotonAccion variante="peligro" onClick={onEliminar} cargando={pendiente}>
        Eliminar galería
      </BotonAccion>
      {error ? (
        <p role="alert" className="text-sm font-bold text-vino">
          {error}
        </p>
      ) : null}
    </div>
  );
}
