/**
 * Helpers de formato (Intl es-MX) para el panel de gestión documental.
 * Puros y sin dependencias de Next/React: reutilizables en cliente y en tests.
 */
import type { NivelAcceso } from "@/lib/documentos/acceso";

const LOCALE = "es-MX";
const ZONA = "America/Mexico_City";

const nfMes = new Intl.DateTimeFormat(LOCALE, { month: "long" });

/** Nombre del mes (1–12) en español, capitalizado. Ej. 3 → "Marzo". */
export function nombreMes(mes: number): string {
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) return "—";
  const nombre = nfMes.format(new Date(2000, mes - 1, 1));
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

/** Periodo legible de un documento. Ej. (3, 2026) → "Marzo 2026". */
export function periodoLegible(mes: number, anio: number): string {
  return `${nombreMes(mes)} ${anio}`;
}

const ETIQUETA_NIVEL: Record<NivelAcceso, string> = {
  publico: "Público",
  asociados: "Asociados",
  consejo: "Consejo",
};

/** Etiqueta legible del nivel de acceso. */
export function etiquetaNivel(nivel: NivelAcceso): string {
  return ETIQUETA_NIVEL[nivel] ?? nivel;
}

const nfFechaHora = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: ZONA,
});

/** Fecha y hora legibles (zona CDMX) a partir de un ISO string o Date. */
export function fechaHoraLegible(valor: string | number | Date): string {
  const fecha = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  return nfFechaHora.format(fecha);
}

/** Doce meses con su número, para poblar selects. */
export const MESES: ReadonlyArray<{ valor: number; nombre: string }> =
  Array.from({ length: 12 }, (_, i) => ({
    valor: i + 1,
    nombre: nombreMes(i + 1),
  }));

/** Rango de años ofrecido en el alta (año actual … 5 años atrás). */
export function aniosDisponibles(anioActual: number): number[] {
  return Array.from({ length: 6 }, (_, i) => anioActual - i);
}
