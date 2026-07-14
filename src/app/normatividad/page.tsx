import type { Metadata } from "next";
import Image from "next/image";
import { Boton, Contenedor, Eyebrow, Pill, TarjetaSolida, Titulo } from "@/components/ui";
import { TarjetaClara } from "./_componentes/tarjetas";

export const metadata: Metadata = {
  title: "Normatividad y ecosistema",
  description:
    "COMENOR articula el ecosistema nacional de Infraestructura de la Calidad: normalización, certificación, laboratorios e inspección, su arquitectura técnica y su Código de Ética y Conducta Profesional.",
};

/** Pilares del ecosistema — slide 05. */
const PILARES = [
  { titulo: "Certificación", descripcion: "Organismos de Certificación" },
  { titulo: "Laboratorios", descripcion: "Ensayo y calibración" },
  { titulo: "Inspección", descripcion: "Unidades de inspección" },
] as const;

/** Mandato Estatutario — slide 05. */
const MANDATO = [
  "Armonización con ISO · IEC · CODEX y organismos internacionales",
  "Acuerdos de reconocimiento mutuo bilateral y multilateral",
  "Interlocutor ante los tres Poderes del Estado Mexicano",
  "Catálogo Nacional de NMX, NOM y Estándares actualizado",
] as const;

/** Arquitectura técnica — slide 06. */
const ORGANISMOS = [
  { siglas: "ONNCCE", ambito: "Construcción y obra civil" },
  { siglas: "INNTEX", ambito: "Textiles y equipo de protección personal" },
  { siglas: "NYCE", ambito: "Electrónica / TIC / Química" },
  { siglas: "IMNC (IMEEC)", ambito: "Multisector ISO / Sistemas de gestión" },
  { siglas: "ULSE", ambito: "Seguridad contra incendios" },
  { siglas: "CANACERO", ambito: "Siderurgia y acero" },
] as const;

/** Franja de logos de la slide 06. Dimensiones intrínsecas de public/media/normatividad/. */
const LOGOS = [
  { src: "/media/normatividad/logo-imeec.png", alt: "IMEEC", width: 342, height: 109 },
  { src: "/media/normatividad/logo-onncce.png", alt: "ONNCCE", width: 313, height: 374 },
  {
    src: "/media/normatividad/logo-ul-standards-engagement.png",
    alt: "UL Standards & Engagement",
    width: 500,
    height: 192,
  },
  { src: "/media/normatividad/logo-inntex.png", alt: "INNTEX", width: 358, height: 246 },
  { src: "/media/normatividad/logo-nyce.png", alt: "NYCE, a QIMA company", width: 463, height: 182 },
  { src: "/media/normatividad/logo-canacero.png", alt: "CANACERO", width: 431, height: 190 },
] as const;

// TODO(tienda): la tienda de normas ASTM sigue viviendo en el WordPress anterior.
// Sustituir por https://tienda.comenor.org.mx en cuanto el subdominio esté publicado.
const URL_TIENDA_ASTM = "https://comenor.org.mx/";

export default function NormatividadPage() {
  return (
    <>
      {/* ——— Slide 05: la casa de todos los actores ——— */}
      <section className="pt-12 pb-16 sm:pt-16 lg:pt-20">
        <Contenedor>
          <Eyebrow>Nuestro ecosistema</Eyebrow>
          <Titulo as="h1" className="mt-3 max-w-[22ch]">
            COMENOR: La casa de todos los actores de la infraestructura de la
            calidad.
          </Titulo>

          <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-2 lg:items-start">
            <div className="flex h-full flex-col justify-center gap-5 bg-blanco/70 p-6 sm:p-8">
              <p className="text-cuerpo text-tinta text-pretty">
                Somos el organismo paraguas que representa y articula el
                ecosistema nacional de Infraestructura de la Calidad en México
                desde 1996.
              </p>
              <p className="text-cuerpo text-tinta text-pretty">
                <strong className="font-bold">COMENOR</strong> actúa como
                interlocutor técnico e institucional ante el gobierno, el sector
                productivo y los foros internacionales — vinculando organismos
                de normalización, certificación, laboratorios y unidades de
                inspección acreditados.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TarjetaSolida
                variante="vino"
                titulo="Normalización"
                descripcion="NOM · NMX / EMX"
                className="justify-center"
              />
              {PILARES.map((pilar) => (
                <TarjetaClara
                  key={pilar.titulo}
                  titulo={pilar.titulo}
                  descripcion={pilar.descripcion}
                />
              ))}
            </div>
          </div>

          {/* La banda del Mandato Estatutario es verde-700 (#0C5753) en la slide 05. */}
          <div className="mt-6 bg-verde-700 p-6 sm:p-8">
            <h2 className="text-center text-base font-bold text-blanco sm:text-lg">
              Mandato Estatutario (Estatutos COMENOR, reformados julio 2024)
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {MANDATO.map((punto) => (
                <li
                  key={punto}
                  className="text-cuerpo border-vino border-l-2 pl-4 text-salvia text-pretty"
                >
                  {punto}
                </li>
              ))}
            </ul>
          </div>
        </Contenedor>
      </section>

      {/* ——— Slide 06: arquitectura técnica ——— */}
      <section className="py-16 lg:py-20">
        <Contenedor>
          <Eyebrow>Nuestro ecosistema</Eyebrow>
          <Titulo as="h2" className="mt-3 max-w-[22ch]">
            La arquitectura técnica que representa COMENOR en
            normalización/estandarización
          </Titulo>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {ORGANISMOS.map((organismo, indice) => (
              <li key={organismo.siglas}>
                <TarjetaSolida
                  variante={indice % 2 === 0 ? "verde-700" : "verde-900"}
                  titulo={organismo.siglas}
                  descripcion={organismo.ambito}
                  className="justify-center"
                />
              </li>
            ))}
          </ul>

          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-14">
            {LOGOS.map((logo) => (
              <li key={logo.src}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  sizes="(max-width: 640px) 40vw, 160px"
                  className="h-10 w-auto sm:h-12"
                />
              </li>
            ))}
          </ul>
        </Contenedor>
      </section>

      {/*
        ——— Slide 07: Código de Ética y Conducta Profesional ———
        La slide vive completa (los 10 principios + la tarjeta lateral) en
        /codigo-etica, que es la página canónica. Aquí solo queda el resumen
        con el enlace, para no duplicar el bloque.
      */}
      <section className="py-16 lg:py-20">
        <Contenedor>
          <div className="tema-oscuro flex flex-col items-start gap-6 bg-verde p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="flex flex-col items-start gap-4">
              <Eyebrow variante="sobre-oscuro">Nuestro ecosistema</Eyebrow>
              <h2 className="text-titulo text-blanco text-balance">
                Código de Ética y Conducta Profesional
              </h2>
              <p className="text-cuerpo max-w-[52ch] text-salvia text-pretty">
                Diez principios —de la Legalidad a la Protección del interés
                público y colectivo— garantizan la imparcialidad que el mercado
                internacional exige. Vinculante · Obligatorio para todos los
                Asociados y Miembros (Art. 2 — Código de Ética COMENOR, 2025).
              </p>
            </div>
            <Boton
              href="/codigo-etica"
              variante="sobre-oscuro"
              tamano="lg"
              className="shrink-0"
            >
              Ver los 10 principios
            </Boton>
          </div>
        </Contenedor>
      </section>

      {/* ——— Tienda de normas ASTM (vive en el sitio anterior) ——— */}
      <section className="pb-20">
        <Contenedor>
          <div className="tema-oscuro flex flex-col items-start gap-6 bg-verde-900 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-start gap-4">
              <Pill variante="verde">Tienda de normas</Pill>
              <h2 className="text-titulo text-blanco text-balance">
                Normas ASTM
              </h2>
              <p className="text-cuerpo max-w-[52ch] text-salvia text-pretty">
                La consulta y compra de normas ASTM se realiza en la tienda de
                COMENOR, alojada por ahora en el sitio anterior.
              </p>
            </div>
            <Boton
              href={URL_TIENDA_ASTM}
              variante="sobre-oscuro"
              tamano="lg"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              Ir a la tienda de normas
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </Boton>
          </div>
        </Contenedor>
      </section>
    </>
  );
}
