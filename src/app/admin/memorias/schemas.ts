/**
 * Esquemas Zod del módulo Memorias. No existían en src/lib/schemas/ (solo hay
 * evento/documento/registro/contacto/login), así que se definen aquí, junto a
 * su consumidor. Validación DOBLE: el formulario (cliente) y la server action
 * (servidor) usan el mismo esquema.
 */
import { z } from "zod";

const ANIO_MIN = 1990;
const ANIO_MAX = 2100;

/** Alta/edición de una galería (metadatos, sin fotos). */
export const galeriaSchema = z.object({
  titulo: z
    .string({ required_error: "El título es obligatorio." })
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(200, "El título no puede exceder 200 caracteres."),
  anio: z.coerce
    .number({
      required_error: "El año es obligatorio.",
      invalid_type_error: "El año debe ser un número.",
    })
    .int("El año debe ser un número entero.")
    .min(ANIO_MIN, `El año no puede ser anterior a ${ANIO_MIN}.`)
    .max(ANIO_MAX, `El año no puede ser posterior a ${ANIO_MAX}.`),
  eventoId: z
    .string()
    .uuid("El evento asociado no es válido.")
    .nullable()
    .optional(),
  publicada: z.coerce.boolean().default(false),
});

export type GaleriaInput = z.infer<typeof galeriaSchema>;
/** Tipo de los valores del formulario (entrada del esquema, antes de coerción). */
export type GaleriaFormValues = z.input<typeof galeriaSchema>;

/** Reordenamiento de fotos: lista de ids en el nuevo orden. */
export const reordenFotosSchema = z.object({
  ids: z
    .array(z.string().uuid("Identificador de foto inválido."))
    .min(1, "Se requiere al menos una foto para reordenar."),
});

export type ReordenFotosInput = z.infer<typeof reordenFotosSchema>;
