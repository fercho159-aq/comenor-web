import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
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
            icono={<Mail className="size-7" strokeWidth={1.75} aria-hidden />}
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
            icono={<Phone className="size-7" strokeWidth={1.75} aria-hidden />}
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
