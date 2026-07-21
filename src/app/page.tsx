import type { Metadata } from "next";
import AgendaEjes from "./propuesta/_components/AgendaEjes";
import CierreContacto from "./propuesta/_components/CierreContacto";
import CodigoEtica from "./propuesta/_components/CodigoEtica";
import DefinicionInstitucional from "./propuesta/_components/DefinicionInstitucional";
import EcosistemaTecnico from "./propuesta/_components/EcosistemaTecnico";
import HeroTesis from "./propuesta/_components/HeroTesis";
import OrganismoParaguas from "./propuesta/_components/OrganismoParaguas";
import Prioridades2026 from "./propuesta/_components/Prioridades2026";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "COMENOR articula el ecosistema nacional de la Infraestructura de la Calidad: organismos de normalización, organismos de certificación, laboratorios de ensayo y unidades de inspección.",
  alternates: { canonical: "/" },
};

/*
 * Home con la dirección "Norma" (misma composición que /propuesta).
 *
 * A diferencia de /propuesta, aquí se conserva el encabezado global (la
 * navegación del sitio es indispensable en el home). Se suprimen solo los
 * elementos del layout raíz que pertenecen al lenguaje de diapositiva
 * rechazado o que duplican el cierre de esta composición:
 *   · swoosh de fondo y barra lateral rotada (los `div[aria-hidden]` hijos
 *     directos del body),
 *   · pie de página viejo — `CierreContacto` ya cierra con el contacto y la
 *     ÚNICA regla vino full-bleed de la página; el footer añadiría una segunda.
 * El `<style>` vive solo mientras esta ruta está montada (render en servidor,
 * sin FOUC ni CLS). No se edita layout.tsx: las demás rutas siguen usando su
 * cromática hasta que el rediseño se extienda página por página.
 */
const CSS_SIN_CROMA_SLIDE = `
body > footer,
body > div[aria-hidden="true"] {
  display: none !important;
}
`;

export default function PaginaInicio() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS_SIN_CROMA_SLIDE }} />

      <HeroTesis />
      <DefinicionInstitucional />
      <OrganismoParaguas />
      <EcosistemaTecnico />
      <CodigoEtica />
      <AgendaEjes />
      <Prioridades2026 />
      <CierreContacto />
    </>
  );
}
