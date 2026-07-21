import type { Metadata } from "next";
import AgendaEjes from "./_components/AgendaEjes";
import CierreContacto from "./_components/CierreContacto";
import CodigoEtica from "./_components/CodigoEtica";
import DefinicionInstitucional from "./_components/DefinicionInstitucional";
import EcosistemaTecnico from "./_components/EcosistemaTecnico";
import HeroTesis from "./_components/HeroTesis";
import OrganismoParaguas from "./_components/OrganismoParaguas";
import Prioridades2026 from "./_components/Prioridades2026";

/**
 * /propuesta — Propuesta de rediseño para COMENOR (dirección "Norma").
 *
 * Página interna de presentación: NO indexable (robots noindex/nofollow). El
 * `title` es absoluto para no arrastrar la plantilla "%s | COMENOR" del layout
 * raíz, ya que esta vista es un entregable de propuesta, no una página pública.
 *
 * Convivencia con el layout raíz
 * ------------------------------
 * `src/app/layout.tsx` envuelve TODA página con cromática global: encabezado
 * sticky, pie de página (que remata en su propia barra vino full-width), la
 * barra lateral de contacto rotada 90° (`BarraLateralVertical`) y el swoosh de
 * fondo. Tres de esos elementos son justamente el lenguaje de "diapositiva" que
 * la clienta rechazó (swoosh decorativo, sidebar rotado) o que compiten con la
 * firma única de esta página (la ÚNICA regla vino full-bleed vive en el cierre).
 * No se puede editar `layout.tsx` (fuera del alcance de esta tarea), así que se
 * suprime esa cromática SOLO para esta ruta mediante una regla CSS con alcance
 * de vida del componente: el `<style>` existe en el DOM únicamente mientras
 * `/propuesta` está montada y se retira al navegar a otra ruta. Se renderiza en
 * el servidor (sin `precedence`, no se hoistea ni dedupe), de modo que aplica en
 * el primer pintado: cero parpadeo (FOUC) y cero salto de layout (CLS).
 *
 * El fondo `humo` de las secciones claras y `verde` de las oscuras es opaco, por
 * lo que el swoosh queda cubierto de todas formas; se oculta igual por limpieza.
 *
 * Orden de secciones y ritmo de color (claro·claro·OSCURO·claro·claro·claro·
 * OSCURO·claro): Hero → Institución → Organismo Paraguas (ancla verde) →
 * Ecosistema → Principios → Agenda → Prioridades/Visión 2026 (ancla verde) →
 * Cierre. Las dos bandas verde hacen respirar al humo.
 */

export const metadata: Metadata = {
  title: { absolute: "Propuesta de rediseño — COMENOR" },
  description:
    "Propuesta de rediseño del sitio de COMENOR. Documento interno de presentación.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: null },
};

/**
 * Oculta la cromática del layout raíz (encabezado, pie, barra lateral rotada y
 * swoosh de fondo) mientras esta ruta está montada. Selectores por hijo directo
 * del `body`: los únicos `div[aria-hidden="true"]` a ese nivel son el swoosh y
 * la barra lateral; `header`/`footer` son sus propias etiquetas.
 */
const CSS_SIN_CROMA_GLOBAL = `
body > header,
body > footer,
body > div[aria-hidden="true"] {
  display: none !important;
}
`;

export default function PaginaPropuesta() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS_SIN_CROMA_GLOBAL }} />

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
