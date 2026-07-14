import { z } from "zod";

/** Niveles de acceso válidos de un documento (espeja el enum de Postgres). */
export const nivelesAcceso = ["publico", "asociados", "consejo"] as const;

/** Alta/edición de documentos desde el panel de administración. */
export const documentoSchema = z.object({
  titulo: z
    .string({ required_error: "El título es obligatorio." })
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(200, "El título no puede exceder 200 caracteres."),
  mes: z
    .number({
      required_error: "El mes es obligatorio.",
      invalid_type_error: "El mes debe ser un número.",
    })
    .int("El mes debe ser un número entero.")
    .min(1, "El mes debe estar entre 1 y 12.")
    .max(12, "El mes debe estar entre 1 y 12."),
  anio: z
    .number({
      required_error: "El año es obligatorio.",
      invalid_type_error: "El año debe ser un número.",
    })
    .int("El año debe ser un número entero.")
    .min(2000, "El año debe ser 2000 o posterior.")
    .max(2100, "El año no puede ser mayor a 2100."),
  nivelAcceso: z.enum(nivelesAcceso, {
    required_error: "El nivel de acceso es obligatorio.",
    invalid_type_error: "Selecciona un nivel de acceso válido.",
  }),
  tipo: z
    .string({ required_error: "El tipo de documento es obligatorio." })
    .trim()
    .min(2, "El tipo debe tener al menos 2 caracteres.")
    .max(100, "El tipo no puede exceder 100 caracteres."),
  storagePath: z
    .string({ required_error: "La ruta de almacenamiento es obligatoria." })
    .trim()
    .min(1, "La ruta de almacenamiento es obligatoria.")
    .max(500, "La ruta no puede exceder 500 caracteres."),
  formato: z
    .string({ required_error: "El formato es obligatorio." })
    .trim()
    .min(2, "El formato debe tener al menos 2 caracteres.")
    .max(20, "El formato no puede exceder 20 caracteres."),
});

export type DocumentoInput = z.infer<typeof documentoSchema>;
