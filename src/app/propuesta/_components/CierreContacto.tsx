import Link from "next/link";
import { Revelar, RevelarGrupo } from "@/components/anim";

/**
 * Sección "Cierre / Contacto" (id: cierre).
 *
 * Ritmo variado: split 7/5 en lg — la tesis final (Montserrat 300 con remate
 * en bold) y el único botón vino de la página a la izquierda; los canales de
 * contacto y redes como columna de referencia a la derecha. Sin lomo numerado.
 * El vino aparece con disciplina: el tick del eyebrow, el botón "Escríbenos" y
 * — como último trazo de TODO el sitio — la regla de marca full-bleed de 6px,
 * usada exactamente una vez.
 *
 * Copy: design-source/text/presentacion.txt L327 (tesis de cierre), L331-358
 * (redes: LinkedIn, Instagram @comenormx, X @Comenormx) y L359-367 (contacto).
 * TODO(copy): Facebook y YouTube en la fuente apuntan a comenor.org.mx
 * (placeholder, no perfiles reales) — omitidos hasta confirmar URLs verdaderas.
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
        <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
          <span aria-hidden className="block h-0.5 w-6 bg-vino" />
          Contacto
        </p>

        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Tesis de cierre + CTA */}
          <div className="lg:col-span-7">
            <Revelar
              as="h2"
              className="max-w-[22ch] text-[clamp(1.75rem,1.25rem+2vw,2.5rem)] font-light leading-[1.15] tracking-[-0.01em] text-pretty text-verde"
            >
              Que COMENOR esté en la mesa donde se decide —{" "}
              <b className="font-bold">no en la sala de espera.</b>
            </Revelar>

            {/* CTA de cierre: el ÚNICO botón vino de la página */}
            <Revelar as="div" className="mt-12">
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-vino px-8 py-3.5 text-lg font-bold text-blanco transition-colors duration-150 hover:bg-vino-900"
              >
                Escríbenos
              </Link>
            </Revelar>
          </div>

          {/* Columna de referencia: canales directos + redes */}
          <div className="mt-14 lg:col-span-5 lg:mt-0 lg:border-l lg:border-salvia lg:pl-12">
            <RevelarGrupo as="ul" stagger={0.06} className="space-y-8">
              {CANALES.map(({ etiqueta, dato, href }) => (
                <li key={etiqueta} className="border-t border-salvia pt-5 lg:border-t-0 lg:pt-0">
                  <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
                    {etiqueta}
                  </span>
                  <a
                    href={href}
                    className="mt-2 inline-block break-all text-[1.125rem] font-bold text-verde underline decoration-1 underline-offset-4 transition-colors hover:text-verde-700"
                  >
                    {dato}
                  </a>
                </li>
              ))}
            </RevelarGrupo>

            <Revelar
              as="ul"
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-salvia pt-6"
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
          </div>
        </div>
      </div>

      {/* Firma de marca: regla vino full-bleed de 6px — usada UNA sola vez en
          todo el sitio, como último trazo de la página. */}
      <div aria-hidden="true" className="mt-20 h-1.5 w-full bg-vino lg:mt-32" />
    </section>
  );
}
