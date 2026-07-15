/**
 * Helpers de formato (es-MX) para el panel de registros. Puros y sin
 * dependencias de servidor: se usan tanto en Server como en Client Components.
 */

const fechaHora = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

const fechaCorta = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "America/Mexico_City",
});

/** Fecha + hora en es-MX (zona CDMX). */
export function formatearFechaHora(fecha: Date | string): string {
  return fechaHora.format(typeof fecha === "string" ? new Date(fecha) : fecha);
}

/** Solo fecha, en es-MX (zona CDMX). */
export function formatearFecha(fecha: Date | string): string {
  return fechaCorta.format(typeof fecha === "string" ? new Date(fecha) : fecha);
}
