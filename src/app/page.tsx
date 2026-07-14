import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Boton,
  Contenedor,
  Eyebrow,
  Foto,
  Pill,
  TarjetaSolida,
  Titulo,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "COMENOR articula el ecosistema nacional de la Infraestructura de la Calidad: organismos de normalización, organismos de certificación, laboratorios de ensayo y unidades de inspección.",
  alternates: { canonical: "/" },
};

/* ————————————————————————————————————————————————————————————————
 * Contenido. Todo proviene de la presentación institucional del cliente
 * (design-source/text/presentacion.txt). Cero datos inventados.
 * ———————————————————————————————————————————————————————————————— */

/**
 * Slide 06 — arquitectura técnica. El orden es el de la slide; el color se
 * deriva del índice para reproducir el tablero de ajedrez de la slide
 * (claro/oscuro/claro · oscuro/claro/oscuro). La tarjeta clara es verde-700.
 */
const ORGANISMOS = [
  { nombre: "ONNCCE", sector: "Construcción y obra civil" },
  { nombre: "INNTEX", sector: "Textiles y equipo de protección personal" },
  { nombre: "NYCE", sector: "Electrónica / TIC / Química" },
  { nombre: "IMNC (IMEEC)", sector: "Multisector ISO / Sistemas de gestión" },
  { nombre: "ULSE", sector: "Seguridad contra incendios" },
  { nombre: "CANACERO", sector: "Siderurgia y acero" },
] as const satisfies ReadonlyArray<{ nombre: string; sector: string }>;

/** Slide 04 — las cuatro categorías de asociados y miembros. */
const CATEGORIAS_ASOCIADOS = [
  "Organismos Nacionales de Normalización",
  "Organismos de Certificación",
  "Unidades de Inspección",
  "Laboratorio de Pruebas",
] as const;

/**
 * Slides 04 y 06 — logotipos de asociados y miembros.
 * Reconstruidos del PPTX (capa de color + máscara alfa) y optimizados en
 * public/media/inicio/logos/. `ancho`/`alto` son los píxeles reales del archivo.
 */
const LOGOS_ASOCIADOS = [
  { archivo: "imeec", nombre: "IMEEC", ancho: 342, alto: 109 },
  { archivo: "onncce", nombre: "ONNCCE", ancho: 184, alto: 220 },
  { archivo: "nyce", nombre: "NYCE, a QIMA company", ancho: 440, alto: 173 },
  { archivo: "inntex", nombre: "INNTEX", ancho: 320, alto: 220 },
  { archivo: "canacero", nombre: "CANACERO", ancho: 431, alto: 190 },
  {
    archivo: "ul-standards",
    nombre: "UL Standards & Engagement",
    ancho: 440,
    alto: 169,
  },
  {
    archivo: "mexen",
    nombre: "Mexen, Mexicana de Evaluación y Normalización, S.A. de C.V.",
    ancho: 304,
    alto: 220,
  },
  { archivo: "isatel", nombre: "Isatel", ancho: 314, alto: 220 },
  { archivo: "intertek", nombre: "Intertek", ancho: 167, alto: 220 },
  { archivo: "sgs", nombre: "SGS", ancho: 440, alto: 210 },
  {
    archivo: "factual-services",
    nombre: "Factual Services S.C.",
    ancho: 440,
    alto: 214,
  },
  { archivo: "diadecor", nombre: "DIADECOR", ancho: 440, alto: 64 },
  { archivo: "tyssa", nombre: "TYSSA", ancho: 201, alto: 220 },
  { archivo: "canieti", nombre: "CANIETI", ancho: 440, alto: 161 },
  { archivo: "radson", nombre: "Laboratorios RADSON", ancho: 440, alto: 79 },
  { archivo: "ivestel", nombre: "IVESTEL", ancho: 415, alto: 120 },
  {
    archivo: "tecnom",
    nombre: "Laboratorio Tecnom de México",
    ancho: 419,
    alto: 220,
  },
  {
    archivo: "teso",
    nombre: "Laboratorio TESO de México, S.A. de C.V.",
    ancho: 440,
    alto: 199,
  },
  {
    archivo: "advance-wire",
    nombre: "Advance Wire & Wireless Laboratorios",
    ancho: 372,
    alto: 220,
  },
  { archivo: "ampliequipos", nombre: "Ampliequipos", ancho: 342, alto: 220 },
  {
    archivo: "conducca",
    nombre: "ConduCCA SA, Conductores CCA para tu casa",
    ancho: 440,
    alto: 182,
  },
] as const;

/* ————————————————————————————————————————————————————————————————
 * Iconos de las tarjetas de contacto (slide 15). Decorativos: el título de la
 * tarjeta ya nombra el canal.
 * ———————————————————————————————————————————————————————————————— */

function IconoSobre() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-7"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3 6 9 6.5L21 6" />
    </svg>
  );
}

function IconoTelefono() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-7"
    >
      <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 5.2 2 2 0 0 1 5 3h1.5Z" />
    </svg>
  );
}

/* ————————————————————————————————————————————————————————————————
 * Página
 * ———————————————————————————————————————————————————————————————— */

export default function PaginaInicio() {
  return (
    <>
      {/* ——— Hero (slide 01) —————————————————————————————————————— */}
      <section className="relative overflow-hidden pb-4 lg:pb-0">
        <Contenedor className="relative pt-10 sm:pt-14 lg:min-h-[42rem] lg:py-24">
          <div className="flex flex-col items-start lg:w-[52%]">
            <Image
              src="/logo-comenor.svg"
              alt="COMENOR"
              width={228}
              height={90}
              priority
              // El optimizador de Next rechaza SVG salvo con dangerouslyAllowSVG.
              unoptimized
              className="h-auto w-[11.5rem] sm:w-[14rem]"
            />

            <Titulo as="h1" className="mt-8 sm:mt-10">
              Consejo Mexicano de Normalización y Evaluación de la Conformidad
            </Titulo>

            <p className="text-cuerpo text-tinta mt-5 max-w-[36ch] text-pretty sm:mt-6 sm:text-lg">
              La confianza técnica que estandariza y evalúa lo Hecho en México.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4">
              <Boton href="/nosotros" tamano="lg">
                Conoce COMENOR
              </Boton>
              <Boton href="/asociados" variante="secundario" tamano="lg">
                Nuestros asociados
              </Boton>
            </div>
          </div>
        </Contenedor>

        {/*
          Panel diagonal verde con el mapa de México punteado, montado sobre el
          collage industrial en escala de grises separado por diagonales blancas.
          El arte trae su propio fondo humo (#E6E6E6), el mismo del body, así que
          empalma con la página sin costura visible.
          · < lg: va en el flujo, bajo el titular, con su proporción natural
            (no se recorta nada).
          · ≥ lg: se ancla al costado derecho y se recorta a la altura del hero.
            Se deja aire a la derecha (right-8) para no pisar la BarraLateralVertical.
        */}
        <div className="relative mx-auto mt-10 w-full max-w-[24rem] lg:absolute lg:inset-y-0 lg:right-8 lg:m-0 lg:w-[42%] lg:max-w-none">
          <div className="relative aspect-[772/941] w-full lg:aspect-auto lg:h-full">
            <Image
              src="/media/inicio/hero-panel-mexico.jpg"
              alt="Mapa de México sobre un collage industrial en escala de grises: viales de laboratorio, un contenedor de carga suspendido y un edificio corporativo."
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* ——— ¿Quiénes somos? (slides 02 y 05) ——————————————————————— */}
      <section className="py-16 lg:py-24">
        <Contenedor>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>Nuestra institución</Eyebrow>
              <Titulo as="h2" className="mt-3">
                ¿Quiénes somos?
              </Titulo>

              <p className="text-cuerpo text-tinta mt-6 text-pretty">
                El Consejo Mexicano de Normalización y Evaluación de la
                Conformidad, A.C. (COMENOR) es una asociación que impulsa el
                fortalecimiento de una{" "}
                <strong>Infraestructura de la Calidad</strong> más eficiente,
                incluyente, accesible y competitiva para México.
              </p>
              <p className="text-cuerpo text-tinta mt-4 text-pretty">
                Somos el organismo paraguas que representa y articula el
                ecosistema nacional de Infraestructura de la Calidad en México{" "}
                <strong>desde 1996</strong>. COMENOR actúa como interlocutor
                técnico e institucional ante el gobierno, el sector productivo y
                los foros internacionales.
              </p>
              <p className="text-cuerpo text-tinta mt-4 text-pretty">
                Nuestro compromiso es promover la cultura de la calidad, la
                confianza y la competitividad, contribuyendo al desarrollo
                económico, la innovación y el fortalecimiento de los mercados a
                través de la normalización y la evaluación de la conformidad.
              </p>

              <div className="mt-8">
                <Boton href="/nosotros" variante="secundario">
                  Conoce nuestra institución
                </Boton>
              </div>
            </div>

            <Foto
              src="/media/inicio/consejo-comenor.jpg"
              alt="Integrantes de COMENOR reunidos en asamblea."
              width={1600}
              height={1066}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="w-full"
            />
          </div>
        </Contenedor>
      </section>

      {/* ——— Ecosistema: arquitectura técnica (slide 06) —————————————— */}
      <section className="py-16 lg:py-24">
        <Contenedor>
          <Eyebrow>Nuestro ecosistema</Eyebrow>
          <Titulo as="h2" className="mt-3 max-w-[26ch] break-words">
            {/* <wbr /> deja que «normalización/estandarización» rompa por la
                barra en móvil en lugar de desbordar horizontalmente. */}
            La arquitectura técnica que representa COMENOR en normalización/
            <wbr />
            estandarización
          </Titulo>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
            {ORGANISMOS.map((organismo, indice) => (
              <li key={organismo.nombre}>
                <TarjetaSolida
                  titulo={organismo.nombre}
                  descripcion={organismo.sector}
                  variante={indice % 2 === 0 ? "verde-700" : "verde-900"}
                />
              </li>
            ))}
          </ul>
        </Contenedor>
      </section>

      {/* ——— Asociados y miembros (slide 04) ————————————————————————— */}
      <section className="py-16 lg:py-24">
        <Contenedor ancho="ancho">
          <Eyebrow>Nuestra institución</Eyebrow>
          <Titulo as="h2" className="mt-3">
            Nuestros asociados y miembros
          </Titulo>

          <ul className="mt-8 flex flex-wrap gap-2 sm:gap-3">
            {CATEGORIAS_ASOCIADOS.map((categoria) => (
              <li key={categoria}>
                <Pill>{categoria}</Pill>
              </li>
            ))}
          </ul>

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:mt-14 lg:grid-cols-5 lg:gap-x-10 lg:gap-y-12">
            {LOGOS_ASOCIADOS.map((logo) => (
              <li
                key={logo.archivo}
                className="flex h-20 items-center justify-center sm:h-24"
              >
                <Image
                  src={`/media/inicio/logos/${logo.archivo}.png`}
                  alt={logo.nombre}
                  width={logo.ancho}
                  height={logo.alto}
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 25vw, 40vw"
                  className="h-auto max-h-full w-auto max-w-full object-contain"
                />
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <Boton href="/asociados" variante="secundario">
              Ver todos los asociados y miembros
            </Boton>
          </div>
        </Contenedor>
      </section>

      {/* ——— Agenda y próximos eventos (slide 08) ———————————————————— */}
      <section className="py-16 lg:py-24">
        <Contenedor>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <Eyebrow>Nuestro trabajo</Eyebrow>
              <Titulo as="h2" className="mt-3">
                Agenda COMENOR
              </Titulo>
              {/* NOTA: el PPT dice "buscar impulsar" (typo); publicamos la corrección — pendiente de confirmar con el cliente. */}
              <p className="text-cuerpo text-tinta mt-6 text-pretty">
                COMENOR busca impulsar una Infraestructura de la Calidad moderna,
                confiable e incluyente, capaz de responder a los retos
                productivos, regulatorios y sociales del país. Nuestra agenda no
                busca más reglas, sino mejores decisiones; no más trámites, sino
                más confianza; no más fragmentación, sino visión de Estado.
              </p>
            </div>

            {/*
              TODO(datos): reemplazar este bloque estático por los próximos eventos
              leídos de la tabla `events` (@/db/schema): filtrar por estado
              publicado y fecha futura, ordenar ascendente y limitar a 3.
              Formatear fecha con Intl.DateTimeFormat("es-MX") y el costo
              (costo_centavos / 100) con Intl.NumberFormat("es-MX", { currency: "MXN" }).
              Mientras no haya eventos cargados NO se inventa contenido: se
              muestra el estado vacío.
            */}
            <div className="tema-oscuro bg-verde-900 flex flex-col justify-center gap-4 p-8 sm:p-10">
              <h3 className="text-blanco text-xl font-bold">Próximos eventos</h3>
              <p className="text-cuerpo text-salvia text-pretty">
                Aún no hay eventos publicados. Aquí aparecerán las próximas
                sesiones, foros y convocatorias de COMENOR en cuanto se anuncien.
              </p>
              {/* TODO: restituir el CTA <Boton href="/eventos"> cuando exista el
                  módulo de calendario (fase 2). Hoy /eventos no existe: un enlace
                  aquí sería un 404. */}
            </div>
          </div>
        </Contenedor>
      </section>

      {/* ——— Contacto (slide 15) ——————————————————————————————————— */}
      <section className="py-16 lg:py-24">
        <Contenedor>
          <Eyebrow>Conecta con nosotros</Eyebrow>
          <Titulo as="h2" className="mt-3">
            Contacto
          </Titulo>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <TarjetaSolida
              titulo="Mail"
              variante="verde-700"
              icono={<IconoSobre />}
            >
              <Link
                href="mailto:direccioncomenor@comenor.org.mx"
                className="text-blanco font-bold break-words underline underline-offset-4 sm:text-lg"
              >
                direccioncomenor@comenor.org.mx
              </Link>
            </TarjetaSolida>

            <TarjetaSolida
              titulo="Teléfono & WhatsApp"
              variante="verde-900"
              icono={<IconoTelefono />}
            >
              <Link
                href="tel:+525527453035"
                className="text-blanco font-bold underline underline-offset-4 sm:text-lg"
              >
                55 2745 3035
              </Link>
            </TarjetaSolida>
          </div>

          <div className="mt-10">
            <Boton href="/contacto" tamano="lg">
              Escríbenos
            </Boton>
          </div>
        </Contenedor>
      </section>
    </>
  );
}
