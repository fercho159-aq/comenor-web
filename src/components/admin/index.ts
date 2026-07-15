/**
 * UI kit del panel de administración de COMENOR.
 * Consistente con los tokens de marca del sitio (src/app/globals.css) y con el
 * kit público (src/components/ui). Accesible: labels, focus-visible, aria-live,
 * navegación por teclado.
 */
export { default as Badge, type EstadoBadge } from "./Badge";
export { default as BotonAccion } from "./BotonAccion";
export {
  default as CampoFormulario,
  type PropsControl,
} from "./CampoFormulario";
export {
  default as TablaAdmin,
  type ColumnaTabla,
  type PaginacionTabla,
} from "./TablaAdmin";
export { default as LayoutAdmin } from "./LayoutAdmin";
