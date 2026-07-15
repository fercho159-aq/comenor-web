import Link from "next/link";

import { Boton, Foto, cn } from "@/components/ui";

import type { EventoConCupo } from "./_datos";
import {
  etiquetaModalidad,
  formatearFechaCorta,
  formatearPrecio,
} from "./_formato";

/**
 * Tarjeta tipo producto de un evento en el calendario público (PLAN §1.6):
 * imagen, fecha, precio (o "Gratuito"), cupo restante y CTA "Registrarme".
 * Si el cupo está lleno, el CTA se sustituye por "Cupo lleno".
 */
export default function TarjetaEvento({ evento }: { evento: EventoConCupo }) {
  const href = `/eventos/${evento.slug}`;
  const esImagenUsable =
    typeof evento.imagenPath === "string" &&
    (evento.imagenPath.startsWith("/") ||
      evento.imagenPath.startsWith("http"));

  return (
    <article className="flex h-full flex-col overflow-hidden bg-blanco shadow-sm ring-1 ring-tinta-suave/15">
      <Link href={href} className="group block" aria-label={evento.nombre}>
        {esImagenUsable ? (
          <Foto
            fill
            src={evento.imagenPath as string}
            alt=""
            variante="redonda"
            className="aspect-[16/9] w-full rounded-none"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex aspect-[16/9] w-full items-center justify-center bg-verde"
          >
            <span className="text-4xl font-bold text-salvia">COMENOR</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-eyebrow tracking-eyebrow uppercase text-tinta-suave">
          {formatearFechaCorta(evento.fecha)} · {etiquetaModalidad(evento.modalidad)}
        </p>

        <h3 className="text-titulo text-balance text-verde">
          <Link href={href} className="hover:underline underline-offset-4">
            {evento.nombre}
          </Link>
        </h3>

        <p className="text-cuerpo text-tinta-suave">{evento.sede}</p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <div>
            <p className="text-xl font-bold text-verde">
              {formatearPrecio(evento.costoCentavos)}
            </p>
            <p
              className={cn(
                "text-sm",
                evento.agotado ? "text-vino" : "text-tinta-suave",
              )}
            >
              {evento.cupoRestante === null
                ? "Cupo abierto"
                : evento.agotado
                  ? "Cupo lleno"
                  : `${evento.cupoRestante} lugares disponibles`}
            </p>
          </div>

          {evento.registrable ? (
            <Boton href={href} tamano="md">
              Registrarme
            </Boton>
          ) : (
            <span className="inline-flex items-center rounded-full border-2 border-tinta-suave/40 px-6 py-2.5 font-bold text-tinta-suave">
              {evento.agotado ? "Cupo lleno" : "Registro cerrado"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
