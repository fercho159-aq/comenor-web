/**
 * Lógica de negocio PURA del panel de administración de eventos.
 *
 * Sin dependencias de Next, el storage ni la base de datos: todo lo testeable en
 * aislamiento (conversión de montos, slug, validación con `eventoSchema`,
 * derivación de rutas de imagen) vive aquí para poder probarse con vitest sin
 * servicios vivos. Las acciones de servidor (acciones.ts) orquestan esto con
 * la BD y el Storage.
 */
import { eventoSchema, type EventoInput } from "@/lib/schemas";

/**
 * Bucket lógico PÚBLICO de imágenes de eventos (prefijo en MinIO).
 *
 * A diferencia del bucket de documentos (privado, URLs firmadas), la portada de
 * un evento se muestra en el calendario público, así que su URL es pública. El
 * calendario público (`src/app/eventos`) espera una URL absoluta en
 * `events.imagen_path`.
 */
export const BUCKET_EVENTOS = "eventos";

/** Formatos de imagen aceptados para la portada del evento. */
export const TIPOS_IMAGEN_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Tamaño máximo de la imagen original subida (5 MB). */
export const TAMANO_MAX_IMAGEN_BYTES = 5 * 1024 * 1024;

/** Campos booleanos que se pueden alternar sin editar el resto del evento. */
export const BANDERAS_EVENTO = ["publicado", "registroAbierto"] as const;
export type BanderaEvento = (typeof BANDERAS_EVENTO)[number];

/** ¿`valor` es una bandera alternable válida? */
export function esBanderaEvento(valor: unknown): valor is BanderaEvento {
  return (
    typeof valor === "string" &&
    (BANDERAS_EVENTO as readonly string[]).includes(valor)
  );
}

/**
 * Convierte un monto en pesos (lo que teclea el operador) a centavos enteros,
 * que es como la BD y `eventoSchema` guardan el costo.
 *
 * - Cadena vacía / sólo espacios ⇒ 0 (evento gratuito).
 * - No numérico ⇒ `NaN` para que la validación Zod lo marque como error de campo.
 * - Redondea al centavo para evitar basura de punto flotante (12.1 → 1210).
 */
export function pesosACentavos(valor: string | number): number {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? Math.round(valor * 100) : NaN;
  }
  const limpio = valor.trim();
  if (limpio === "") return 0;
  const pesos = Number(limpio);
  if (!Number.isFinite(pesos)) return NaN;
  return Math.round(pesos * 100);
}

/** Convierte centavos enteros a pesos (para prellenar el formulario de edición). */
export function centavosAPesos(centavos: number): number {
  return Math.round(centavos) / 100;
}

/**
 * Genera un slug URL-safe a partir del nombre del evento.
 * Minúsculas, sin acentos, separado por guiones. Se usa como sugerencia en el
 * formulario; el operador puede editarlo y `eventoSchema` lo re-valida.
 */
export function generarSlug(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

/**
 * Ruta determinista del objeto de imagen dentro del bucket de eventos:
 *   {id}/portada-{version}.webp
 * El sufijo de versión (timestamp por defecto) evita que el CDN sirva una
 * portada vieja cacheada tras reemplazar la imagen.
 */
export function construirImagenPathEvento(
  id: string,
  version: number = Date.now(),
): string {
  return `${id}/portada-${version}.webp`;
}

/**
 * ¿El archivo es una imagen de tipo y tamaño aceptables?
 * Se valida antes de procesar con sharp para fallar barato y con mensaje claro.
 */
export function validarArchivoImagen(archivo: File): string | null {
  if (archivo.size === 0) {
    return "El archivo de imagen está vacío.";
  }
  if (archivo.size > TAMANO_MAX_IMAGEN_BYTES) {
    return "La imagen no puede exceder 5 MB.";
  }
  if (!(TIPOS_IMAGEN_PERMITIDOS as readonly string[]).includes(archivo.type)) {
    return "Formato no permitido. Usa JPG, PNG o WebP.";
  }
  return null;
}

/**
 * Ciudad de México usa UTC-6 fijo (México eliminó el horario de verano en 2022).
 * El `<input type="datetime-local">` entrega la hora SIN zona; para que se
 * guarde como el instante correcto añadimos el offset de CDMX antes de coercer.
 */
const OFFSET_CDMX = "-06:00";

/**
 * Interpreta un valor de `datetime-local` (`YYYY-MM-DDTHH:mm`) como hora de la
 * Ciudad de México, devolviendo un ISO con offset. Si el valor no tiene ese
 * formato exacto (ya trae zona, o está vacío) lo devuelve sin tocar para que la
 * validación decida.
 */
export function normalizarFechaLocalCDMX(valor: string): string {
  const limpio = valor.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(limpio)) {
    return `${limpio}:00${OFFSET_CDMX}`;
  }
  return valor;
}

/** Campos crudos (strings) tal como llegan del `FormData` del formulario. */
export interface CamposCrudosEvento {
  nombre: string;
  slug: string;
  fecha: string;
  sede: string;
  modalidad: string;
  costoPesos: string;
  cupo: string;
  estado: string;
  descripcion: string;
  publicado: boolean;
  registroAbierto: boolean;
}

/**
 * Lee los campos del evento desde un `FormData` a un objeto de strings.
 * No valida: sólo normaliza tipos de acarreo (checkbox → boolean).
 */
export function leerCamposEvento(form: FormData): CamposCrudosEvento {
  const texto = (clave: string): string => {
    const valor = form.get(clave);
    return typeof valor === "string" ? valor : "";
  };
  const bandera = (clave: string): boolean => {
    const valor = form.get(clave);
    return valor === "true" || valor === "on" || valor === "1";
  };
  return {
    nombre: texto("nombre"),
    slug: texto("slug"),
    fecha: texto("fecha"),
    sede: texto("sede"),
    modalidad: texto("modalidad"),
    costoPesos: texto("costoPesos"),
    cupo: texto("cupo"),
    estado: texto("estado"),
    descripcion: texto("descripcion"),
    publicado: bandera("publicado"),
    registroAbierto: bandera("registroAbierto"),
  };
}

/** Resultado de validar los campos de un evento contra `eventoSchema`. */
export type ResultadoValidacion =
  | { ok: true; datos: EventoInput }
  | { ok: false; errores: Record<string, string[]> };

/**
 * Valida los campos crudos contra el `eventoSchema` COMPARTIDO (el mismo que
 * re-usa el servidor). Convierte pesos→centavos y cupo vacío→null antes de
 * validar. `imagenPath` se inyecta aparte (lo produce la subida a Storage).
 *
 * Devuelve errores POR CAMPO (`fieldErrors`) para que el formulario los pinte
 * junto a cada control (accesibilidad AA, `aria-live`).
 */
export function validarEvento(
  campos: CamposCrudosEvento,
  imagenPath: string | null,
): ResultadoValidacion {
  const candidato = {
    nombre: campos.nombre,
    slug: campos.slug,
    fecha: campos.fecha,
    sede: campos.sede,
    modalidad: campos.modalidad,
    costoCentavos: pesosACentavos(campos.costoPesos),
    cupo: campos.cupo.trim() === "" ? null : Number(campos.cupo),
    estado: campos.estado,
    descripcion: campos.descripcion,
    imagenPath: imagenPath,
    publicado: campos.publicado,
    registroAbierto: campos.registroAbierto,
  };

  const parse = eventoSchema.safeParse(candidato);
  if (!parse.success) {
    return { ok: false, errores: parse.error.flatten().fieldErrors };
  }
  return { ok: true, datos: parse.data };
}
