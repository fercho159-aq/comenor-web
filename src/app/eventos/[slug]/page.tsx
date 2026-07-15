import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Boton, Contenedor, Eyebrow, Foto, Pill, Titulo } from "@/components/ui";

import { buscarEventoPublicadoPorSlug, type EventoConCupo } from "../_datos";
import {
  etiquetaModalidad,
  formatearFechaLarga,
  formatearPrecio,
} from "../_formato";
import FormularioRegistro from "./FormularioRegistro";

// El detalle se renderiza por petición para reflejar el cupo en vivo.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

const SITIO_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://comenor.org.mx";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const evento = await buscarEventoPublicadoPorSlug(slug);

  if (!evento) {
    return { title: "Evento no disponible" };
  }

  const descripcion = evento.descripcion.slice(0, 160);
  const url = `${SITIO_URL}/eventos/${evento.slug}`;

  return {
    title: evento.nombre,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: evento.nombre,
      description: descripcion,
      url,
      ...(esImagenAbsoluta(evento.imagenPath)
        ? { images: [{ url: evento.imagenPath as string }] }
        : {}),
    },
  };
}

function esImagenAbsoluta(imagenPath: string | null): boolean {
  return typeof imagenPath === "string" && imagenPath.startsWith("http");
}

/** JSON-LD schema.org/Event para SEO (PLAN §2.17). */
function jsonLdEvento(evento: EventoConCupo): string {
  const url = `${SITIO_URL}/eventos/${evento.slug}`;
  const modo =
    evento.modalidad === "virtual"
      ? "https://schema.org/OnlineEventAttendanceMode"
      : evento.modalidad === "hibrida"
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode";

  const datos: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: evento.nombre,
    startDate: evento.fecha.toISOString(),
    eventAttendanceMode: modo,
    eventStatus:
      evento.estado === "cancelado"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    description: evento.descripcion,
    url,
    location:
      evento.modalidad === "virtual"
        ? { "@type": "VirtualLocation", url }
        : { "@type": "Place", name: evento.sede },
    organizer: {
      "@type": "Organization",
      name: "COMENOR",
      url: SITIO_URL,
    },
    offers: {
      "@type": "Offer",
      price: (evento.costoCentavos / 100).toFixed(2),
      priceCurrency: "MXN",
      url,
      availability: evento.agotado
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  };

  if (esImagenAbsoluta(evento.imagenPath)) {
    datos.image = [evento.imagenPath];
  }

  return JSON.stringify(datos);
}

export default async function EventoDetallePage({ params }: Params) {
  const { slug } = await params;
  const evento = await buscarEventoPublicadoPorSlug(slug);

  if (!evento) {
    notFound();
  }

  const esGratuito = evento.costoCentavos === 0;
  const esImagen =
    typeof evento.imagenPath === "string" &&
    (evento.imagenPath.startsWith("/") || evento.imagenPath.startsWith("http"));

  return (
    <>
      <script
        type="application/ld+json"
        // Datos controlados por el admin, serializados con JSON.stringify.
        dangerouslySetInnerHTML={{ __html: jsonLdEvento(evento) }}
      />

      <Contenedor as="section" className="py-12 lg:py-16">
        <Boton href="/eventos" variante="secundario" tamano="md">
          ← Volver al calendario
        </Boton>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Columna visual + datos */}
          <div>
            {esImagen ? (
              <Foto
                fill
                src={evento.imagenPath as string}
                alt=""
                className="aspect-[16/9] w-full"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div
                aria-hidden="true"
                className="rounded-foto flex aspect-[16/9] w-full items-center justify-center bg-verde"
              >
                <span className="text-5xl font-bold text-salvia">COMENOR</span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Pill variante="verde">{etiquetaModalidad(evento.modalidad)}</Pill>
              <Pill variante="oscura">{formatearPrecio(evento.costoCentavos)}</Pill>
            </div>

            <dl className="mt-6 grid gap-4 text-cuerpo">
              <div>
                <dt className="font-bold text-verde">Fecha y hora</dt>
                <dd className="text-tinta">{formatearFechaLarga(evento.fecha)}</dd>
              </div>
              <div>
                <dt className="font-bold text-verde">Sede</dt>
                <dd className="text-tinta">{evento.sede}</dd>
              </div>
              <div>
                <dt className="font-bold text-verde">Cupo</dt>
                <dd className={evento.agotado ? "text-vino" : "text-tinta"}>
                  {evento.cupoRestante === null
                    ? "Cupo abierto"
                    : evento.agotado
                      ? "Cupo lleno"
                      : `${evento.cupoRestante} lugares disponibles`}
                </dd>
              </div>
            </dl>
          </div>

          {/* Columna de contenido + registro */}
          <div>
            <Eyebrow>Evento COMENOR</Eyebrow>
            <Titulo as="h1" className="mt-3">
              {evento.nombre}
            </Titulo>
            <p className="text-cuerpo mt-6 whitespace-pre-line text-tinta text-pretty">
              {evento.descripcion}
            </p>

            <div className="mt-10 border-t border-tinta-suave/20 pt-8">
              <Titulo as="h2" tamano="titulo">
                {esGratuito ? "Regístrate" : "Regístrate y paga en línea"}
              </Titulo>

              {evento.registrable ? (
                <>
                  <p className="text-cuerpo mt-3 text-tinta-suave">
                    Todos los campos son obligatorios.{" "}
                    {esGratuito
                      ? "Recibirás tu confirmación y código QR por correo."
                      : "Al confirmar te llevaremos al pago seguro con Mercado Pago."}
                  </p>
                  <FormularioRegistro slug={evento.slug} esGratuito={esGratuito} />
                </>
              ) : (
                <p className="text-cuerpo mt-3 text-vino">
                  {evento.agotado
                    ? "Este evento alcanzó su cupo máximo. Ya no es posible registrarse."
                    : "El registro para este evento está cerrado."}
                </p>
              )}
            </div>
          </div>
        </div>
      </Contenedor>
    </>
  );
}
