"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Badge, BotonAccion } from "@/components/admin";

import {
  eliminarFoto,
  establecerPortada,
  reordenarFotos,
  subirFotos,
} from "./actions";
import { moverEnLista } from "./logica";
import type { FotoFila } from "./tipos";

type Aviso = { tipo: "ok" | "error"; texto: string } | null;

type Props = {
  galeriaId: string;
  fotos: FotoFila[];
};

/**
 * Gestor de fotos: subida (con compresión sharp en el servidor), definición de
 * portada, reordenamiento accesible por botones (Subir/Bajar, sin drag-and-drop)
 * y borrado. Mantiene un orden local optimista y persiste vía server actions.
 */
export default function GestorFotos({ galeriaId, fotos }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [orden, setOrden] = useState<FotoFila[]>(fotos);
  const [subiendo, iniciarSubida] = useTransition();
  const [operando, iniciarOperacion] = useTransition();
  const [aviso, setAviso] = useState<Aviso>(null);

  const anunciar = (resultado: { ok: boolean; mensaje: string }) => {
    setAviso({ tipo: resultado.ok ? "ok" : "error", texto: resultado.mensaje });
  };

  const onSubir = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input?.files || input.files.length === 0) {
      setAviso({ tipo: "error", texto: "Selecciona al menos una foto." });
      return;
    }
    const fd = new FormData();
    for (const archivo of Array.from(input.files)) {
      fd.append("fotos", archivo);
    }
    iniciarSubida(async () => {
      const r = await subirFotos(galeriaId, fd);
      anunciar(r);
      if (r.ok) {
        input.value = "";
        router.refresh();
      }
    });
  };

  const onPortada = (storagePath: string) => {
    iniciarOperacion(async () => {
      const r = await establecerPortada(galeriaId, storagePath);
      anunciar(r);
      if (r.ok) router.refresh();
    });
  };

  const onEliminar = (fotoId: string) => {
    const ok = window.confirm("¿Eliminar esta foto de forma permanente?");
    if (!ok) return;
    iniciarOperacion(async () => {
      const r = await eliminarFoto(fotoId);
      anunciar(r);
      if (r.ok) {
        setOrden((prev) => prev.filter((f) => f.id !== fotoId));
        router.refresh();
      }
    });
  };

  const onMover = (fotoId: string, direccion: "arriba" | "abajo") => {
    const idsNuevos = moverEnLista(
      orden.map((f) => f.id),
      fotoId,
      direccion,
    );
    // Reordena la vista de inmediato (optimista).
    const porId = new Map(orden.map((f) => [f.id, f]));
    const reordenadas = idsNuevos
      .map((id) => porId.get(id))
      .filter((f): f is FotoFila => f !== undefined);
    setOrden(reordenadas);

    iniciarOperacion(async () => {
      const r = await reordenarFotos(galeriaId, idsNuevos);
      anunciar(r);
      if (r.ok) router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={onSubir}
        className="flex flex-col gap-3 border border-tinta-suave/20 bg-blanco p-6 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="fotos-input" className="font-bold text-verde">
            Agregar fotos
          </label>
          <p className="text-sm text-tinta-suave">
            JPG, PNG o WebP. Se comprimen automáticamente al subir (máx. 8 MB c/u).
          </p>
          <input
            ref={inputRef}
            id="fotos-input"
            type="file"
            name="fotos"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="w-full border border-tinta-suave/40 bg-blanco px-4 py-2.5 text-cuerpo text-tinta file:mr-4 file:rounded-full file:border-0 file:bg-verde file:px-4 file:py-1.5 file:font-bold file:text-blanco"
          />
        </div>
        <BotonAccion type="submit" cargando={subiendo}>
          Subir
        </BotonAccion>
      </form>

      {aviso ? (
        <p
          role="status"
          aria-live="polite"
          className={
            aviso.tipo === "ok"
              ? "text-sm font-bold text-verde"
              : "text-sm font-bold text-vino"
          }
        >
          {aviso.texto}
        </p>
      ) : (
        <p role="status" aria-live="polite" className="sr-only" />
      )}

      {orden.length === 0 ? (
        <p className="border border-tinta-suave/20 bg-blanco p-8 text-center text-tinta-suave">
          Esta galería aún no tiene fotos.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {orden.map((foto, indice) => (
            <li
              key={foto.id}
              className="flex flex-col gap-2 border border-tinta-suave/20 bg-blanco p-2"
            >
              <div className="relative">
                {foto.url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL firmada efímera de bucket privado
                  <img
                    src={foto.url}
                    alt={`Foto ${indice + 1} de la galería`}
                    width={320}
                    height={240}
                    className="aspect-[4/3] w-full rounded object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded bg-humo text-sm text-tinta-suave">
                    Vista no disponible
                  </div>
                )}
                {foto.esPortada ? (
                  <span className="absolute left-2 top-2">
                    <Badge estado="publicado">Portada</Badge>
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onMover(foto.id, "arriba")}
                  disabled={indice === 0 || operando}
                  aria-label={`Mover foto ${indice + 1} hacia arriba`}
                  className="rounded-full border border-verde px-2 py-1 text-sm font-bold text-verde disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMover(foto.id, "abajo")}
                  disabled={indice === orden.length - 1 || operando}
                  aria-label={`Mover foto ${indice + 1} hacia abajo`}
                  className="rounded-full border border-verde px-2 py-1 text-sm font-bold text-verde disabled:opacity-40"
                >
                  ↓
                </button>
                {!foto.esPortada ? (
                  <BotonAccion
                    variante="sutil"
                    tamano="sm"
                    onClick={() => onPortada(foto.storagePath)}
                    disabled={operando}
                  >
                    Portada
                  </BotonAccion>
                ) : null}
                <BotonAccion
                  variante="peligro"
                  tamano="sm"
                  onClick={() => onEliminar(foto.id)}
                  disabled={operando}
                >
                  Eliminar
                </BotonAccion>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
