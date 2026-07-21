import { Revelar } from "@/components/anim";

/**
 * Sección 01 · INSTITUCIÓN — "¿Quiénes somos?"
 *
 * Dirección de diseño "Norma": sección clara sobre fondo humo, la primera con
 * LOMO DE REFERENCIA (spine). Server Component; la animación de entrada vive en
 * <Revelar> (client) que se importa sin convertir este archivo en cliente.
 *
 * Layout:
 * - lg: retícula grid-cols-[7rem_1fr] gap-10. La primera celda es el spine
 *   (índice tabular '01', etiqueta 'INSTITUCIÓN', tick vino). La columna de
 *   contenido lleva una hairline vertical salvia (border-l) que traza el margen
 *   continuo del "documento".
 * - <lg: el spine colapsa a un eyebrow horizontal encima del H2.
 *
 * Copy literal de design-source/text/presentacion.txt (L18-42, L86-87).
 * Cero texto inventado. Énfasis = bold del mismo color (nunca vino en texto).
 */
export default function DefinicionInstitucional() {
  return (
    <section id="institucion" className="bg-humo py-20 lg:py-32">
      <div className="mx-auto w-full max-w-[75rem] px-6 sm:px-8 lg:px-12">
        <div className="lg:grid lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-10">
          {/* Spine (lomo de referencia) — solo desktop */}
          <div className="hidden lg:flex lg:flex-col lg:items-start lg:pt-2">
            <span className="font-light tabular-nums text-[1.5rem] leading-none text-verde">
              01
            </span>
            <span className="mt-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
              Institución
            </span>
            <span aria-hidden className="mt-4 block h-[2px] w-3 bg-vino" />
          </div>

          {/* Columna de contenido con la hairline salvia como margen del documento */}
          <div className="lg:border-l lg:border-salvia lg:pl-10">
            {/* Spine colapsado a eyebrow inline — solo móvil/tablet */}
            <p className="mb-6 flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave lg:hidden">
              <span className="tabular-nums text-verde">01</span>
              <span aria-hidden>·</span>
              <span>Institución</span>
              <span
                aria-hidden
                className="ml-1 inline-block h-[11px] w-[3px] bg-vino"
              />
            </p>

            <Revelar
              as="h2"
              className="max-w-[20ch] text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.01em] text-verde text-balance"
            >
              ¿Quiénes somos?
            </Revelar>

            <Revelar
              delay={0.1}
              className="mt-8 max-w-[62ch] space-y-6 text-[1.0625rem] leading-[1.65] text-tinta lg:text-[1.125rem]"
            >
              <p className="text-pretty">
                El Consejo Mexicano de Normalización y Evaluación de la
                Conformidad, A.C. (COMENOR) es una asociación que impulsa el
                fortalecimiento de una{" "}
                <strong className="font-bold text-tinta">
                  Infraestructura de la Calidad
                </strong>{" "}
                más eficiente, incluyente, accesible y competitiva para México.
              </p>
              <p className="text-pretty">
                Estamos integrados por algunos de los actores más relevantes del
                ecosistema de la calidad, entre ellos Organismos Nacionales de
                Normalización, Organismos Nacionales de Certificación de
                Productos y Sistemas de Gestión, Laboratorios de Ensayo y
                Unidades de Verificación de Información Comercial e Instalaciones
                Eléctricas.
              </p>
              <p className="text-pretty">
                Nuestro compromiso es promover la cultura de la calidad, la
                confianza y la competitividad, contribuyendo al desarrollo
                económico, la innovación y el fortalecimiento de los mercados a
                través de la normalización y la evaluación de la conformidad.
              </p>
            </Revelar>

            {/* Declaración-ancla institucional (pull-quote, sin fondo de color) */}
            <Revelar
              as="blockquote"
              delay={0.15}
              className="mt-12 max-w-[24ch] border-t border-salvia pt-10 text-[clamp(1.5rem,1rem+1.5vw,1.75rem)] font-bold leading-[1.2] tracking-[-0.01em] text-verde text-balance"
            >
              COMENOR: la casa de todos los actores de la infraestructura de la
              calidad.
            </Revelar>
          </div>
        </div>
      </div>
    </section>
  );
}
