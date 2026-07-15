/**
 * Helpers de formato para el calendario público (Intl es-MX / MXN — PLAN §2.18).
 */

const FECHA_LARGA = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

const FECHA_CORTA = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Mexico_City",
});

const MONEDA = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

/** Fecha larga con hora, p. ej. "jueves, 24 de septiembre de 2026, 11:00 a.m.". */
export function formatearFechaLarga(fecha: Date): string {
  return FECHA_LARGA.format(fecha);
}

/** Fecha compacta para tarjetas, p. ej. "24 sept 2026". */
export function formatearFechaCorta(fecha: Date): string {
  return FECHA_CORTA.format(fecha);
}

/** Precio en pesos, o "Gratuito" si el costo es 0. */
export function formatearPrecio(costoCentavos: number): string {
  if (costoCentavos === 0) return "Gratuito";
  return MONEDA.format(costoCentavos / 100);
}

/** Etiqueta legible de la modalidad. */
export function etiquetaModalidad(
  modalidad: "presencial" | "virtual" | "hibrida",
): string {
  const mapa = {
    presencial: "Presencial",
    virtual: "Virtual",
    hibrida: "Híbrida",
  } as const;
  return mapa[modalidad];
}
