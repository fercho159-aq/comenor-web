import type { Metadata } from "next";
import Image from "next/image";

import { Contenedor, Eyebrow, Pill, Titulo } from "@/components/ui";

export const metadata: Metadata = {
  title: "Asociados y miembros",
  description:
    "Organismos Nacionales de Normalización, Organismos de Certificación, Unidades de Inspección y Laboratorios de Pruebas que integran el Consejo Mexicano de Normalización y Evaluación de la Conformidad.",
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
  titulo: string;
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
    id: "organismos-nacionales-de-normalizacion",
    titulo: "Organismos Nacionales de Normalización",
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
    id: "organismos-de-certificacion",
    titulo: "Organismos de Certificación",
    logos: [MEXEN, IMEEC, NYCE, ONNCCE, TYSSA, ISATEL, FACTUAL, DIADECOR, SGS, INTERTEK],
  },
  {
    id: "unidades-de-inspeccion",
    titulo: "Unidades de Inspección",
    logos: [IMEEC, ONNCCE, NYCE, MEXEN, FACTUAL, INTERTEK, DIADECOR, SGS],
  },
  {
    id: "laboratorio-de-pruebas",
    titulo: "Laboratorio de Pruebas",
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
        nombre: "CANIETI, Cámara Nacional de la Industria Electrónica, de Telecomunicaciones y Tecnologías de la Información",
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

function TarjetaLogo({ logo }: { logo: Logo }) {
  return (
    <li className="flex h-24 items-center justify-center bg-blanco p-4 sm:h-28">
      <Image
        src={logo.archivo}
        alt={logo.nombre}
        width={logo.ancho}
        height={logo.alto}
        sizes="(min-width: 1024px) 160px, (min-width: 640px) 200px, 40vw"
        className="h-auto max-h-full w-auto max-w-full object-contain"
      />
    </li>
  );
}

export default function AsociadosPage() {
  return (
    <Contenedor as="section" ancho="ancho" className="py-14 lg:py-20">
      <Eyebrow>Nuestra institución</Eyebrow>
      <Titulo as="h1" className="mt-3 max-w-4xl">
        Nuestros asociados y miembros
      </Titulo>
      <p className="mt-6 max-w-3xl text-cuerpo text-tinta">
        Estamos integrados por algunos de los actores más relevantes del ecosistema de la
        calidad, entre ellos Organismos Nacionales de Normalización, Organismos Nacionales de
        Certificación de Productos y Sistemas de Gestión, Laboratorios de Ensayo y Unidades de
        Verificación de Información Comercial e Instalaciones Eléctricas.
      </p>

      <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-x-8 lg:mt-16 lg:grid-cols-4 lg:gap-x-6">
        {CATEGORIAS.map((categoria) => (
          <section key={categoria.id} aria-labelledby={categoria.id}>
            {/* min-h iguala la altura de las pills de 1 y 2 líneas para que los
                grids de logos arranquen a la misma altura en la vista de 4 columnas. */}
            <h2 id={categoria.id} className="flex items-stretch lg:min-h-[4.75rem]">
              <Pill className="w-full px-6 py-3 leading-snug">{categoria.titulo}</Pill>
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              {categoria.logos.map((logo, indice) => (
                <TarjetaLogo key={`${categoria.id}-${logo.archivo}-${indice}`} logo={logo} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Contenedor>
  );
}
