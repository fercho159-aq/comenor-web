import Link from "next/link";
import { Revelar, RevelarGrupo } from "@/components/anim";

/**
 * Sección 8 (id: cierre) — "Cierre / Contacto".
 *
 * Dirección "Norma": el cierre es la última hoja del documento, no una
 * portada de despedida. La tesis final se afirma alineada a la izquierda en
 * Montserrat ligero (300) con el remate en bold — el peso ligero grande sobre
 * humo es lo opuesto al slide. Los canales de contacto NO son tarjetas verdes
 * sólidas (eso era diapositiva): cada canal es una fila de catálogo con
 * hairline salvia arriba, etiqueta de referencia y el dato como enlace. El
 * vino aparece con disciplina quirúrgica: el tick del spine, el único botón de
 * la página ("Escríbenos") y —como último trazo de TODO el sitio— la regla de
 * marca full-bleed de 6px, usada exactamente una vez.
 *
 * Copy: design-source/text/presentacion.txt L327 (tesis de cierre), L331-358
 * (redes: LinkedIn, Instagram @comenormx, X @Comenormx) y L359-367 (contacto:
 * mail y teléfono/WhatsApp). Cero texto inventado.
 * TODO(copy): Facebook y YouTube en la fuente apuntan a comenor.org.mx
 * (placeholder, no perfiles reales) — omitidos hasta confirmar URLs verdaderas.
 *
 * Server Component: los enlaces no requieren estado; el movimiento vive en
 * <Revelar> / <RevelarGrupo> (client) compuestos desde aquí.
 */

/** Canales de contacto directo (fuente: L365-367). */
const CANALES: ReadonlyArray<{
  etiqueta: string;
  dato: string;
  href: string;
}> = [
  {
    etiqueta: "Mail",
    dato: "direccioncomenor@comenor.org.mx",
    href: "mailto:direccioncomenor@comenor.org.mx",
  },
  {
    etiqueta: "Teléfono & WhatsApp",
    dato: "55 2745 3035",
    href: "tel:+525527453035",
  },
];

/** Redes sociales confirmadas (fuente: L332-348). FB/YT omitidas: placeholder. */
const REDES: ReadonlyArray<{ nombre: string; href: string }> = [
  { nombre: "LinkedIn", href: "https://www.linkedin.com/company/comenor" },
  { nombre: "Instagram @comenormx", href: "https://www.instagram.com/comenormx" },
  { nombre: "X @Comenormx", href: "https://x.com/Comenormx" },
];

export default function CierreContacto() {
  return (
    <section id="cierre" className="bg-humo py-20 lg:py-32">
      <div className="mx-auto w-full max-w-[75rem] px-6 sm:px-8 lg:px-12">
        <div className="lg:grid lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-10">
          {/* Lomo de referencia (spine) — solo desktop */}
          <Revelar as="div" className="hidden lg:flex lg:flex-col lg:items-start">
            <span className="font-light tabular-nums text-[1.5rem] leading-none text-verde">
              06
            </span>
            <span className="mt-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
              Contacto
            </span>
            <span aria-hidden="true" className="mt-4 block h-0.5 w-3 bg-vino" />
          </Revelar>

          {/* Columna de contenido — margen continuo del documento (hairline) */}
          <div className="lg:border-l lg:border-salvia lg:pl-10">
            {/* Spine colapsado a eyebrow inline — solo <lg */}
            <p className="flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave lg:hidden">
              <span className="font-light tabular-nums text-[0.875rem] text-verde">
                06
              </span>
              <span aria-hidden="true">·</span>
              <span>Contacto</span>
              <span aria-hidden="true" className="ml-1 block h-0.5 w-3 bg-vino" />
            </p>

            {/* Tesis de cierre de la página (L327): ligera con remate en bold */}
            <Revelar
              as="h2"
              className="mt-4 max-w-[22ch] text-[clamp(1.75rem,1.25rem+2vw,2.5rem)] font-light leading-[1.15] tracking-[-0.01em] text-pretty text-verde lg:mt-0"
            >
              Que COMENOR esté en la mesa donde se decide —{" "}
              <b className="font-bold">no en la sala de espera.</b>
            </Revelar>

            {/* Canales directos: filas de catálogo, sin tarjetas sólidas */}
            <RevelarGrupo
              as="ul"
              stagger={0.06}
              className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2"
            >
              {CANALES.map(({ etiqueta, dato, href }) => (
                <li key={etiqueta} className="border-t border-salvia pt-5">
                  <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
                    {etiqueta}
                  </span>
                  <a
                    href={href}
                    className="mt-2 inline-block text-[1.125rem] font-bold text-verde underline decoration-1 underline-offset-4 transition-colors hover:text-verde-700"
                  >
                    {dato}
                  </a>
                </li>
              ))}
            </RevelarGrupo>

            {/* Redes sociales confirmadas: fila de etiquetas pequeñas */}
            <Revelar
              as="ul"
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2"
            >
              {REDES.map(({ nombre, href }) => (
                <li key={nombre}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.8125rem] font-medium text-verde underline decoration-1 underline-offset-4 transition-colors hover:text-verde-700"
                  >
                    {nombre}
                  </a>
                </li>
              ))}
            </Revelar>

            {/* CTA de cierre: el ÚNICO botón vino de la página (toque humano) */}
            <Revelar as="div" className="mt-14">
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-vino px-8 py-3.5 text-lg font-bold text-blanco transition-colors duration-150 hover:bg-vino-900"
              >
                Escríbenos
              </Link>
            </Revelar>
          </div>
        </div>
      </div>

      {/* Firma de marca: regla vino full-bleed de 6px — usada UNA sola vez en
          todo el sitio, como último trazo de la página. */}
      <div
        aria-hidden="true"
        className="mt-20 h-1.5 w-full bg-vino lg:mt-32"
      />
    </section>
  );
}
