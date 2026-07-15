/**
 * Tokens de marca y helpers de formato para los correos transaccionales.
 *
 * Fuente de verdad visual: docs/BRAND.md. Los colores se repiten aquí (en vez de
 * importarse de globals.css) porque el correo se renderiza a HTML con estilos
 * INLINE — los clientes de correo (Gmail, Outlook) no ejecutan Tailwind ni CSS
 * externo. Mantener sincronizado con el `@theme` de src/app/globals.css.
 */
export const marca = {
  verde: "#004F4A",
  verde700: "#0C5753",
  verde900: "#1E3535",
  vino: "#B62438",
  vino900: "#7A1526",
  humo: "#E6E6E6",
  salvia: "#CAD6D6",
  tinta: "#1E3535",
  tintaSuave: "#5A6A6A",
  blanco: "#FFFFFF",
} as const;

/**
 * Pila tipográfica para correo. Montserrat es la familia de marca; los clientes
 * que no la carguen caen a una sans-serif segura. `<Font>` de React Email inyecta
 * el @font-face; esta constante se usa además en los estilos inline por si el
 * @font-face se ignora (Outlook de escritorio).
 */
export const familiaTipografica =
  "Montserrat, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Dominio institucional para enlaces y firmas. */
export const sitioUrl = "https://comenor.org.mx";

/** Formatea un monto en centavos MXN con Intl es-MX (PLAN.md §2.18). */
export function formatearMonto(centavos: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(centavos / 100);
}

/** Formatea una fecha larga con hora en español de México. */
export function formatearFechaHora(fecha: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(fecha);
}

/** Nombre legible del mes (1–12) en español de México. */
export function nombreMes(mes: number): string {
  // Día fijo al 15 para evitar corrimientos de zona horaria en los bordes.
  const fecha = new Date(Date.UTC(2000, mes - 1, 15));
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    timeZone: "UTC",
  }).format(fecha);
}
