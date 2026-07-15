import type { Metadata } from "next";
import { Contenedor, TarjetaSolida, Titulo } from "@/components/ui";
import { Revelar, RevelarGrupo } from "@/components/anim";
import FormularioContacto from "./FormularioContacto";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos a direccioncomenor@comenor.org.mx o llámanos al 55 2745 3035. También puedes enviarnos un mensaje desde el formulario de contacto de COMENOR.",
};

const CORREO = "direccioncomenor@comenor.org.mx";
const TELEFONO = "55 2745 3035";
const TELEFONO_E164 = "+525527453035";

/** Sobre del icono de la tarjeta "Mail" (slide 15). */
function IconoSobre() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-7"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  );
}

/** Auricular con ondas de la tarjeta "Teléfono & WhatsApp" (slide 15). */
function IconoTelefono() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-7"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6.5 3.5 4 6c-.7.7-.9 1.7-.6 2.6a20 20 0 0 0 11.9 11.9c.9.3 1.9.1 2.6-.6l2.5-2.5-4-3-2 1.6a15.5 15.5 0 0 1-6.4-6.4l1.6-2z" />
      <path d="M14 3.5a6.5 6.5 0 0 1 6.5 6.5" />
      <path d="M14 7a3 3 0 0 1 3 3" />
    </svg>
  );
}

export default function ContactoPage() {
  return (
    <>
      {/* ——— Slide 15: Contacto ——— */}
      <Contenedor as="section" className="py-16 text-center lg:py-24">
        {/* La slide 15 lleva el título solo, centrado: sin eyebrow. */}
        <Titulo as="h1">
          Contacto
        </Titulo>

        <RevelarGrupo className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2 lg:gap-8">
          <TarjetaSolida
            variante="verde-700"
            titulo="Mail"
            icono={<IconoSobre />}
            className="justify-center py-10"
            descripcion={
              <a
                href={`mailto:${CORREO}`}
                className="break-words underline underline-offset-4 hover:text-blanco"
              >
                {CORREO}
              </a>
            }
          />

          <TarjetaSolida
            variante="verde-900"
            titulo="Teléfono & WhatsApp"
            icono={<IconoTelefono />}
            className="justify-center py-10"
            descripcion={
              <a
                href={`tel:${TELEFONO_E164}`}
                className="underline underline-offset-4 hover:text-blanco"
              >
                {TELEFONO}
              </a>
            }
          />
        </RevelarGrupo>
      </Contenedor>

      {/* ——— Formulario de contacto (validación doble cliente/servidor) ——— */}
      <Contenedor as="section" ancho="estrecho" className="pb-20 lg:pb-28">
        <Revelar>
          <Titulo as="h2" tamano="titulo">
            Envíanos un mensaje
          </Titulo>
          <p className="text-cuerpo mt-4 text-tinta text-pretty">
            Completa el formulario y el equipo de COMENOR te responderá al correo
            que nos indiques.
          </p>
        </Revelar>

        <Revelar delay={0.1}>
          <FormularioContacto />
        </Revelar>
      </Contenedor>
    </>
  );
}
