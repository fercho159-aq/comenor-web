import type { Metadata } from "next";
import { Revelar, RevelarGrupo } from "@/components/anim";
import { Contenedor, Eyebrow, Foto, Titulo } from "@/components/ui";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "El Consejo Mexicano de Normalización y Evaluación de la Conformidad, A.C. (COMENOR) impulsa una Infraestructura de la Calidad más eficiente, incluyente, accesible y competitiva para México.",
};

export default function NosotrosPage() {
  return (
    <>
      {/* ——— Slide 02: ¿Quiénes somos? ——— */}
      <Contenedor as="section" className="py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Revelar>
            <Eyebrow>Nuestra institución</Eyebrow>
            <Titulo as="h1" className="mt-4">
              ¿Quiénes somos?
            </Titulo>

            <p className="text-titulo mt-8 text-verde">
              El Consejo Mexicano de Normalización y Evaluación de la
              Conformidad, A.C.
            </p>

            <div className="text-cuerpo mt-6 space-y-5 text-pretty text-tinta">
              <p>
                (COMENOR) es una asociación que impulsa el fortalecimiento de
                una Infraestructura de la Calidad más eficiente, incluyente,
                accesible y competitiva para México.
              </p>
              <p>
                Estamos integrados por algunos de los actores más relevantes del
                ecosistema de la calidad, entre ellos Organismos Nacionales de
                Normalización, Organismos Nacionales de Certificación de
                Productos y Sistemas de Gestión, Laboratorios de Ensayo y
                Unidades de Verificación de Información Comercial e
                Instalaciones Eléctricas.
              </p>
              <p>
                Nuestro compromiso es promover la cultura de la calidad, la
                confianza y la competitividad, contribuyendo al desarrollo
                económico, la innovación y el fortalecimiento de los mercados a
                través de la normalización y la evaluación de la conformidad.
              </p>
            </div>
          </Revelar>

          <Foto
            src="/media/nosotros/consejo-comenor-foto-grupal.jpg"
            alt="Asociados y miembros de COMENOR reunidos para la foto grupal del Consejo."
            width={2048}
            height={1365}
            priority
            sizes="(min-width: 1024px) 44vw, 100vw"
            className="aspect-[4/3] w-full"
          />
        </div>
      </Contenedor>

      {/* ——— Slide 08: Agenda COMENOR ——— */}
      <Contenedor as="section" className="pb-20 lg:pb-28">
        <RevelarGrupo className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>Nuestro trabajo</Eyebrow>
            <Titulo as="h2" className="mt-4">
              Agenda COMENOR
            </Titulo>

            {/* NOTA: el PPT dice "buscar impulsar" (typo); publicamos la corrección — pendiente de confirmar con el cliente. */}
            <p className="text-cuerpo mt-6 text-pretty text-tinta">
              <strong className="font-bold">COMENOR</strong> busca impulsar una{" "}
              <strong className="font-bold">
                Infraestructura de la Calidad
              </strong>{" "}
              moderna, confiable e incluyente, capaz de responder a los retos
              productivos, regulatorios y sociales del país. Nuestra agenda no
              busca más reglas, sino{" "}
              <strong className="font-bold">mejores decisiones</strong>; no más
              trámites, sino <strong className="font-bold">más confianza</strong>
              ; no más fragmentación, sino{" "}
              <strong className="font-bold">visión de Estado.</strong>
            </p>
          </div>

          <Foto
            src="/media/nosotros/agenda-comenor.jpg"
            alt="Agenda abierta sobre un escritorio de madera."
            width={2048}
            height={1371}
            sizes="(min-width: 1024px) 44vw, 100vw"
            className="aspect-[4/3] w-full lg:order-last"
          />
        </RevelarGrupo>
      </Contenedor>
    </>
  );
}
