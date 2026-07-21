import { Revelar } from "@/components/anim";

/**
 * Sección "¿Quiénes somos?" (id: institucion).
 *
 * Dirección "Norma", ritmo variado: split editorial asimétrico 4/8 en lg —
 * columna izquierda con eyebrow, H2 y la declaración-ancla (pull-quote);
 * columna derecha con el cuerpo. Sin lomo numerado: la numeración de sección
 * leía como línea de tiempo.
 *
 * Copy literal de design-source/text/presentacion.txt (L18-42, L86-87).
 * Cero texto inventado. Énfasis = bold del mismo color.
 */
export default function DefinicionInstitucional() {
  return (
    <section id="institucion" className="bg-humo py-20 lg:py-32">
      <div className="mx-auto w-full max-w-[75rem] px-6 sm:px-8 lg:px-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Columna editorial: eyebrow + título + declaración-ancla */}
          <div className="lg:col-span-4">
            <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
              <span aria-hidden className="block h-0.5 w-6 bg-vino" />
              Institución
            </p>

            <Revelar
              as="h2"
              className="mt-5 max-w-[20ch] text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.01em] text-verde text-balance"
            >
              ¿Quiénes somos?
            </Revelar>

            {/* Declaración-ancla institucional (pull-quote, sin fondo de color) */}
            <Revelar
              as="blockquote"
              delay={0.15}
              className="mt-10 hidden max-w-[20ch] border-t border-salvia pt-8 text-[clamp(1.375rem,1rem+1.25vw,1.625rem)] font-bold leading-[1.25] tracking-[-0.01em] text-verde text-balance lg:block"
            >
              COMENOR: la casa de todos los actores de la infraestructura de la
              calidad.
            </Revelar>
          </div>

          {/* Columna de cuerpo */}
          <div className="mt-8 lg:col-span-8 lg:mt-0 lg:border-l lg:border-salvia lg:pl-12">
            <Revelar
              delay={0.1}
              className="max-w-[62ch] space-y-6 text-[1.0625rem] leading-[1.65] text-tinta lg:text-[1.125rem]"
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

            {/* En móvil/tablet la declaración-ancla cierra la sección */}
            <Revelar
              as="blockquote"
              delay={0.15}
              className="mt-10 max-w-[24ch] border-t border-salvia pt-8 text-[clamp(1.375rem,1rem+1.25vw,1.625rem)] font-bold leading-[1.25] tracking-[-0.01em] text-verde text-balance lg:hidden"
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
