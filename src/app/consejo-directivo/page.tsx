import type { Metadata } from "next";
import { Contenedor, Eyebrow, Foto, Titulo } from "@/components/ui";
import { Revelar, RevelarGrupo } from "@/components/anim";

export const metadata: Metadata = {
  title: "Consejo Directivo",
  description:
    "Integrantes del Consejo Directivo del Consejo Mexicano de Normalización y Evaluación de la Conformidad, A.C. (COMENOR).",
};

type Integrante = {
  nombre: string;
  cargo: string;
  foto: string;
};

/** Copy y retratos tomados de la slide 03 (design-source/text/presentacion.txt). */
const presidente: Integrante = {
  nombre: "Carlos Manuel Pérez Munguía",
  cargo: "Presidente",
  foto: "/media/consejo/carlos-manuel-perez-munguia.jpg",
};

const direccionGeneral: Integrante = {
  nombre: "Karla Fernández Sánchez",
  cargo: "Directora General",
  foto: "/media/consejo/karla-fernandez-sanchez.jpg",
};

const consejo: readonly Integrante[] = [
  {
    nombre: "Nomeil Sigfrido Vásquez Martínez",
    cargo: "Secretario",
    foto: "/media/consejo/nomeil-sigfrido-vasquez-martinez.jpg",
  },
  {
    nombre: "Marco Antonio Heredia Duvignau",
    cargo: "Vicepresidente de Actividades de Evaluación de la Conformidad",
    foto: "/media/consejo/marco-antonio-heredia-duvignau.jpg",
  },
  {
    nombre: "Evangelina Hirata Nagasako",
    cargo: "Vicepresidenta de Actividades de Estandarización",
    foto: "/media/consejo/evangelina-hirata-nagasako.jpg",
  },
  {
    nombre: "José Zavala Chávez",
    cargo: "Tesorero",
    foto: "/media/consejo/jose-zavala-chavez.jpg",
  },
];

const vocales: readonly Integrante[] = [
  {
    nombre: "Mariana García Cortés",
    cargo: "Vocal",
    foto: "/media/consejo/mariana-garcia-cortes.jpg",
  },
  {
    nombre: "Gloria Paloma Puga Martínez",
    cargo: "Vocal",
    foto: "/media/consejo/gloria-paloma-puga-martinez.jpg",
  },
  {
    nombre: "Viviana Fernández Camargo",
    cargo: "Vocal",
    foto: "/media/consejo/viviana-fernandez-camargo.jpg",
  },
];

const todos: readonly Integrante[] = [
  presidente,
  direccionGeneral,
  ...consejo,
  ...vocales,
];

/** Retrato circular + nombre + cargo. Es la unidad del organigrama (desktop). */
function NodoOrganigrama({
  integrante,
  prioridad = false,
}: {
  integrante: Integrante;
  prioridad?: boolean;
}) {
  return (
    <figure className="flex flex-col items-center text-center">
      <Foto
        src={integrante.foto}
        alt={`Retrato de ${integrante.nombre}`}
        variante="circular"
        width={640}
        height={640}
        sizes="144px"
        priority={prioridad}
        className="w-36"
      />
      <figcaption className="mt-4 max-w-56">
        <p className="text-sm font-bold text-verde">{integrante.nombre}</p>
        <p className="text-sm text-tinta-suave">{integrante.cargo}</p>
      </figcaption>
    </figure>
  );
}

/** Tarjeta apilada para 375/768 px: mismo dato, sin líneas conectoras. */
function TarjetaIntegrante({
  integrante,
  prioridad = false,
}: {
  integrante: Integrante;
  prioridad?: boolean;
}) {
  return (
    <figure className="flex items-center gap-4 rounded-foto border-l-4 border-verde bg-blanco p-4">
      <Foto
        src={integrante.foto}
        alt={`Retrato de ${integrante.nombre}`}
        variante="circular"
        width={640}
        height={640}
        sizes="80px"
        priority={prioridad}
        className="w-20 shrink-0"
      />
      <figcaption className="min-w-0">
        <p className="text-base font-bold text-verde">{integrante.nombre}</p>
        <p className="text-sm text-tinta-suave">{integrante.cargo}</p>
      </figcaption>
    </figure>
  );
}

export default function ConsejoDirectivoPage() {
  return (
    <Contenedor as="section" className="py-14 lg:py-20">
      <Eyebrow>Nuestra institución</Eyebrow>
      <Titulo as="h1" className="mt-2">
        Consejo Directivo
      </Titulo>

      {/* ——— Organigrama (≥1024px): jerarquía con líneas conectoras verdes ——— */}
      <div className="mt-14 hidden lg:block">
        {/* Nivel 1 — Presidencia (reveal mínimo: no penalizar LCP del retrato prioritario) */}
        <div className="flex justify-center">
          <Revelar y={12} duracion={0.4}>
            <NodoOrganigrama integrante={presidente} prioridad />
          </Revelar>
        </div>

        {/* Nivel 2 — Dirección General: línea punteada (relación de staff, slide 03) */}
        <div className="relative">
          {/* tronco vertical que baja de la Presidencia */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-verde"
          />
          <div className="relative grid grid-cols-2 pt-10 pb-4">
            <div className="flex items-start">
              <Revelar delay={0.1}>
                <NodoOrganigrama integrante={direccionGeneral} />
              </Revelar>
              <div
                aria-hidden
                className="mt-[4.5rem] h-0 flex-1 border-t-2 border-dashed border-verde"
              />
            </div>
            <div />
          </div>
        </div>

        {/* Conectores hacia el nivel 3 (4 nodos: centros en 12.5 / 37.5 / 62.5 / 87.5 %) */}
        <div aria-hidden className="relative h-14">
          <div className="absolute top-0 left-1/2 h-7 w-0.5 -translate-x-1/2 bg-verde" />
          <div className="absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-verde" />
          {["12.5%", "37.5%", "62.5%", "87.5%"].map((izq) => (
            <div
              key={izq}
              style={{ left: izq }}
              className="absolute top-7 h-7 w-0.5 -translate-x-1/2 bg-verde"
            />
          ))}
        </div>

        {/* Nivel 3 — Secretaría, Vicepresidencias y Tesorería */}
        <RevelarGrupo as="ul" delay={0.15} className="grid grid-cols-4">
          {consejo.map((integrante) => (
            <li key={integrante.nombre} className="flex justify-center">
              <NodoOrganigrama integrante={integrante} />
            </li>
          ))}
        </RevelarGrupo>

        {/*
          Conectores hacia las vocalías. Como en la slide 03, la barra cuelga del
          nivel 3 COMPLETO: baja un tramo desde los cuatro nodos (12.5 / 37.5 /
          62.5 / 87.5 %, incluida la Tesorería) hasta una barra horizontal que
          los abarca, y de ahí bajan los tres tramos a las vocalías
          (centros de grid-cols-3: 16.6 / 50 / 83.3 %).
        */}
        <div aria-hidden className="relative h-14">
          {["12.5%", "37.5%", "62.5%", "87.5%"].map((izq) => (
            <div
              key={izq}
              style={{ left: izq }}
              className="absolute top-0 h-7 w-0.5 -translate-x-1/2 bg-verde"
            />
          ))}
          <div className="absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-verde" />
          {["16.6667%", "50%", "83.3333%"].map((izq) => (
            <div
              key={izq}
              style={{ left: izq }}
              className="absolute top-7 h-7 w-0.5 -translate-x-1/2 bg-verde"
            />
          ))}
        </div>

        {/* Nivel 4 — Vocalías */}
        <RevelarGrupo as="ul" className="grid grid-cols-3">
          {vocales.map((integrante) => (
            <li key={integrante.nombre} className="flex justify-center">
              <NodoOrganigrama integrante={integrante} />
            </li>
          ))}
        </RevelarGrupo>
      </div>

      {/* ——— Lista por nivel (<1024px): sin scroll horizontal ——— */}
      <RevelarGrupo
        as="ul"
        className="mt-10 grid gap-4 sm:grid-cols-2 lg:hidden"
      >
        {todos.map((integrante, indice) => (
          <li key={integrante.nombre}>
            <TarjetaIntegrante integrante={integrante} prioridad={indice === 0} />
          </li>
        ))}
      </RevelarGrupo>
    </Contenedor>
  );
}
