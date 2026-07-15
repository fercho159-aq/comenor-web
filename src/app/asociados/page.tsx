import type { Metadata } from "next";
import Image from "next/image";

import { Revelar, RevelarGrupo } from "@/components/anim";
import { Boton, Contenedor, Eyebrow, Titulo } from "@/components/ui";

export const metadata: Metadata = {
  title: "Asociados y miembros",
  description:
    "Organismos Nacionales de Normalización, Organismos de Certificación, Unidades de Inspección y Laboratorios de Pruebas que integran el Consejo Mexicano de Normalización y Evaluación de la Conformidad.",
  alternates: { canonical: "/asociados" },
};

type Logo = {
  /** Nombre de la organización, tal como aparece en su logotipo. */
  nombre: string;
  archivo: string;
  ancho: number;
  alto: number;
};

type Categoria = {
  id: string;
  /** Verbo de la función que ejerce el grupo (estructura de la página). */
  verbo: string;
  titulo: string;
  /** Etiqueta corta para el índice de navegación. */
  corto: string;
  /** Qué hace esta función dentro de la evaluación de la conformidad. */
  descripcion: string;
  logos: Logo[];
};

const IMEEC: Logo = {
  nombre: "IMEEC",
  archivo: "/media/asociados/imeec.png",
  ancho: 342,
  alto: 109,
};
const ONNCCE: Logo = {
  nombre: "ONNCCE",
  archivo: "/media/asociados/onncce.png",
  ancho: 313,
  alto: 374,
};
const NYCE: Logo = {
  nombre: "NYCE, a QIMA company",
  archivo: "/media/asociados/nyce.png",
  ancho: 463,
  alto: 182,
};
const MEXEN: Logo = {
  nombre: "Mexen, Mexicana de Evaluación y Normalización, S.A. de C.V.",
  archivo: "/media/asociados/mexen.png",
  ancho: 354,
  alto: 256,
};
const ISATEL: Logo = {
  nombre: "Isatel",
  archivo: "/media/asociados/isatel.png",
  ancho: 400,
  alto: 280,
};
const TYSSA: Logo = {
  nombre: "TS TYSSA",
  archivo: "/media/asociados/tyssa.png",
  ancho: 238,
  alto: 261,
};
const FACTUAL: Logo = {
  nombre: "Factual Services S.C., certificación e inspección",
  archivo: "/media/asociados/factual-services.png",
  ancho: 460,
  alto: 224,
};
const DIADECOR: Logo = {
  nombre: "DIADECOR",
  archivo: "/media/asociados/diadecor.png",
  ancho: 800,
  alto: 116,
};
const SGS: Logo = {
  nombre: "SGS",
  archivo: "/media/asociados/sgs.png",
  ancho: 651,
  alto: 303,
};
const INTERTEK: Logo = {
  nombre: "Intertek",
  archivo: "/media/asociados/intertek.png",
  ancho: 210,
  alto: 277,
};

const CATEGORIAS: Categoria[] = [
  {
    id: "normalizacion",
    verbo: "Normalizar",
    titulo: "Organismos Nacionales de Normalización",
    corto: "Normalización",
    descripcion:
      "Redactan las normas —NOM y NMX— que fijan el estándar técnico con el que México mide la calidad.",
    logos: [
      IMEEC,
      ONNCCE,
      {
        nombre: "UL Standards & Engagement",
        archivo: "/media/asociados/ul-standards-engagement.png",
        ancho: 500,
        alto: 192,
      },
      {
        nombre: "INNTEX",
        archivo: "/media/asociados/inntex.png",
        ancho: 358,
        alto: 246,
      },
      {
        nombre: "CANACERO",
        archivo: "/media/asociados/canacero.png",
        ancho: 431,
        alto: 190,
      },
      NYCE,
    ],
  },
  {
    id: "certificacion",
    verbo: "Certificar",
    titulo: "Organismos de Certificación",
    corto: "Certificación",
    descripcion:
      "Acreditan que un producto, sistema o proceso cumple la norma que le aplica.",
    logos: [MEXEN, IMEEC, NYCE, ONNCCE, TYSSA, ISATEL, FACTUAL, DIADECOR, SGS, INTERTEK],
  },
  {
    id: "inspeccion",
    verbo: "Inspeccionar",
    titulo: "Unidades de Inspección",
    corto: "Inspección",
    descripcion:
      "Verifican en campo que lo instalado o declarado corresponde con lo que exige la norma.",
    logos: [IMEEC, ONNCCE, NYCE, MEXEN, FACTUAL, INTERTEK, DIADECOR, SGS],
  },
  {
    id: "laboratorio-de-pruebas",
    verbo: "Ensayar",
    titulo: "Laboratorio de Pruebas",
    corto: "Laboratorio",
    descripcion:
      "Realizan los ensayos y mediciones que sustentan cada certificación con evidencia técnica.",
    logos: [
      INTERTEK,
      MEXEN,
      DIADECOR,
      {
        nombre: "Advance Wire & Wireless Laboratorios",
        archivo: "/media/asociados/advance-wire-wireless.png",
        ancho: 406,
        alto: 240,
      },
      {
        nombre: "IVESTEL",
        archivo: "/media/asociados/ivestel.png",
        ancho: 415,
        alto: 120,
      },
      {
        nombre: "AMPLIEQUIPOS",
        archivo: "/media/asociados/ampliequipos.png",
        ancho: 376,
        alto: 242,
      },
      {
        nombre: "Laboratorios Radson",
        archivo: "/media/asociados/laboratorios-radson.png",
        ancho: 476,
        alto: 86,
      },
      {
        nombre: "Laboratorio TESO de México, S.A. de C.V.",
        archivo: "/media/asociados/teso.png",
        ancho: 750,
        alto: 340,
      },
      {
        nombre: "Laboratorio Tecnom de México S.C.",
        archivo: "/media/asociados/tecnom.png",
        ancho: 438,
        alto: 230,
      },
      NYCE,
      ISATEL,
      {
        nombre:
          "CANIETI, Cámara Nacional de la Industria Electrónica, de Telecomunicaciones y Tecnologías de la Información",
        archivo: "/media/asociados/canieti.png",
        ancho: 482,
        alto: 176,
      },
      SGS,
      TYSSA,
      {
        nombre: "ConduCCAsa, conductores CCA para tu casa",
        archivo: "/media/asociados/conduccasa.png",
        ancho: 788,
        alto: 326,
      },
    ],
  },
];

/** Nombre corto (antes de la primera coma) para la leyenda de la tarjeta. */
function nombreCorto(nombre: string): string {
  return nombre.split(",")[0]!.trim();
}

function TarjetaLogo({ logo }: { logo: Logo }) {
  return (
    <li className="group flex flex-col">
      <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-[3px] border border-verde/10 bg-blanco px-5 py-4 transition duration-300 group-hover:border-verde/30 group-hover:shadow-[0_14px_34px_-16px_rgba(0,79,74,0.45)] motion-safe:group-hover:-translate-y-1 sm:h-28">
        <Image
          src={logo.archivo}
          alt={logo.nombre}
          width={logo.ancho}
          height={logo.alto}
          sizes="(min-width: 1024px) 190px, (min-width: 640px) 33vw, 44vw"
          className="h-auto max-h-full w-auto max-w-full object-contain transition duration-300 motion-safe:group-hover:scale-[1.04]"
        />
        {/* Barra vino que barre al pasar el cursor — eco de la franja del pie. */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-vino transition-transform duration-300 group-hover:scale-x-100"
        />
      </div>
      {/* Altura fija: la leyenda aparece sin mover el grid (cero CLS). */}
      <span className="mt-2 flex h-4 items-center justify-center px-1 text-center text-[0.68rem] font-medium uppercase tracking-wide text-tinta-suave opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="truncate">{nombreCorto(logo.nombre)}</span>
      </span>
    </li>
  );
}

function RielFuncion({ categoria }: { categoria: Categoria }) {
  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <Revelar y={16}>
        <div className="flex items-center gap-3">
          <span className="size-2.5 shrink-0 bg-vino" aria-hidden />
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-tinta-suave">
            {categoria.verbo}
          </span>
        </div>
        <h2
          id={`${categoria.id}-h`}
          className="mt-3 text-2xl font-bold leading-tight text-verde sm:text-[1.7rem]"
        >
          {categoria.titulo}
        </h2>
        <p className="mt-3 max-w-sm text-cuerpo text-tinta text-pretty">
          {categoria.descripcion}
        </p>
        <div className="mt-6 inline-flex items-baseline gap-2 border-t-2 border-verde pt-2">
          <span className="text-3xl font-bold tabular-nums text-verde">
            {categoria.logos.length}
          </span>
          <span className="text-sm text-tinta-suave">
            {categoria.logos.length === 1 ? "organismo" : "organismos"}
          </span>
        </div>
      </Revelar>
    </div>
  );
}

export default function AsociadosPage() {
  const totalApariciones = CATEGORIAS.reduce((n, c) => n + c.logos.length, 0);

  return (
    <Contenedor as="div" ancho="ancho" className="py-14 lg:py-20">
      {/* ——— Encabezado / tesis ————————————————————————————————————— */}
      <header className="max-w-4xl">
        <Eyebrow>El ecosistema de la calidad</Eyebrow>
        <Titulo as="h1" className="mt-3">
          Nuestros asociados y miembros
        </Titulo>
        <Revelar
          as="p"
          y={16}
          className="mt-6 text-xl font-medium text-verde-700 text-pretty sm:text-2xl"
        >
          Normalizar, certificar, inspeccionar y ensayar: las cuatro funciones
          que respaldan lo Hecho en México.
        </Revelar>
        <Revelar
          as="p"
          y={16}
          delay={0.05}
          className="mt-5 max-w-3xl text-cuerpo text-tinta text-pretty"
        >
          COMENOR está integrado por algunos de los actores más relevantes del
          ecosistema de la calidad: Organismos Nacionales de Normalización,
          Organismos de Certificación de productos y sistemas de gestión,
          Laboratorios de Ensayo y Unidades de Inspección de información
          comercial e instalaciones eléctricas.
        </Revelar>
      </header>

      {/* ——— Índice de funciones (ancla + conteo) ——————————————————— */}
      <nav
        aria-label="Funciones del ecosistema"
        className="mt-10 flex flex-wrap items-center gap-2 border-t border-verde/10 pt-6"
      >
        {CATEGORIAS.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="group inline-flex items-center gap-2 rounded-full border border-verde/25 px-4 py-2 text-sm text-verde transition hover:bg-verde hover:text-blanco focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde"
          >
            <span className="font-semibold">{c.corto}</span>
            <span className="tabular-nums text-tinta-suave transition-colors group-hover:text-salvia">
              {c.logos.length}
            </span>
          </a>
        ))}
        <span className="ml-auto hidden text-sm text-tinta-suave sm:block">
          {totalApariciones} acreditaciones en el padrón
        </span>
      </nav>

      {/* ——— Secciones por función ————————————————————————————————— */}
      <div className="mt-4">
        {CATEGORIAS.map((categoria) => (
          <section
            key={categoria.id}
            id={categoria.id}
            aria-labelledby={`${categoria.id}-h`}
            className="scroll-mt-28 border-t border-verde/10 pt-12 first:border-t-0 lg:pt-16"
          >
            <div className="mt-8 grid gap-8 first:mt-0 lg:grid-cols-[18rem_1fr] lg:gap-14">
              <RielFuncion categoria={categoria} />
              <RevelarGrupo
                as="ul"
                stagger={0.05}
                y={16}
                className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
              >
                {categoria.logos.map((logo, indice) => (
                  <TarjetaLogo
                    key={`${categoria.id}-${logo.archivo}-${indice}`}
                    logo={logo}
                  />
                ))}
              </RevelarGrupo>
            </div>
          </section>
        ))}
      </div>

      {/* ——— CTA de membresía ——————————————————————————————————————— */}
      <Revelar as="section" y={20} className="mt-16 lg:mt-24">
        <div className="relative overflow-hidden bg-verde px-8 py-12 sm:px-12 sm:py-16">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-salvia">
            Sumarse al ecosistema
          </p>
          <Titulo as="h2" variante="sobre-oscuro" className="mt-3 max-w-2xl">
            ¿Tu organismo evalúa la conformidad?
          </Titulo>
          <p className="mt-4 max-w-2xl text-cuerpo text-salvia text-pretty">
            COMENOR reúne a los actores que sostienen la Infraestructura de la
            Calidad en México. Si normalizas, certificas, inspeccionas o
            ensayas, hay lugar para tu organización.
          </p>
          <Boton href="/contacto" variante="sobre-oscuro" className="mt-8">
            Contáctanos
          </Boton>
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5 bg-vino" />
        </div>
      </Revelar>
    </Contenedor>
  );
}
