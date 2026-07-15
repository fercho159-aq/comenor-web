/**
 * Helpers de formato del panel admin de eventos (Intl es-MX / MXN, CDMX).
 * Copia local y autocontenida para no acoplar el panel a la carpeta pública.
 */

const FECHA_LARGA = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

const MONEDA = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

/** Fecha con hora para tablas, p. ej. "24 sept 2026, 11:00". */
export function formatearFecha(fecha: Date): string {
  return FECHA_LARGA.format(fecha);
}

/** Precio en pesos MXN, o "Gratuito" si el costo es 0. */
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

/** Etiqueta legible del estado del ciclo de vida del evento. */
export function etiquetaEstado(
  estado:
    | "borrador"
    | "programado"
    | "en_curso"
    | "finalizado"
    | "cancelado",
): string {
  const mapa = {
    borrador: "Borrador",
    programado: "Programado",
    en_curso: "En curso",
    finalizado: "Finalizado",
    cancelado: "Cancelado",
  } as const;
  return mapa[estado];
}

/**
 * Convierte un `Date` a la cadena que espera `<input type="datetime-local">`
 * (`YYYY-MM-DDTHH:mm`) en horario de la Ciudad de México, para prellenar el
 * formulario de edición sin desfases de zona horaria.
 */
export function fechaParaInput(fecha: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Mexico_City",
  }).formatToParts(fecha);
  const buscar = (tipo: string) =>
    partes.find((p) => p.type === tipo)?.value ?? "00";
  const anio = buscar("year");
  const mes = buscar("month");
  const dia = buscar("day");
  let hora = buscar("hour");
  if (hora === "24") hora = "00"; // en-CA puede emitir "24" a medianoche
  const minuto = buscar("minute");
  return `${anio}-${mes}-${dia}T${hora}:${minuto}`;
}
