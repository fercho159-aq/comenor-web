import { z } from "zod";

/** Modalidades válidas de un evento (espeja el enum de Postgres). */
export const modalidadesEvento = ["presencial", "virtual", "hibrida"] as const;

/** Estados válidos de un evento (espeja el enum de Postgres). */
export const estadosEvento = [
  "borrador",
  "programado",
  "en_curso",
  "finalizado",
  "cancelado",
] as const;

/** Alta/edición de eventos desde el panel de administración. */
export const eventoSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre del evento es obligatorio." })
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(200, "El nombre no puede exceder 200 caracteres."),
  slug: z
    .string({ required_error: "El slug es obligatorio." })
    .trim()
    .min(3, "El slug debe tener al menos 3 caracteres.")
    .max(120, "El slug no puede exceder 120 caracteres.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener minúsculas, números y guiones (ej. congreso-2026).",
    ),
  fecha: z.coerce.date({
    required_error: "La fecha es obligatoria.",
    invalid_type_error: "Ingresa una fecha válida.",
  }),
  sede: z
    .string({ required_error: "La sede es obligatoria." })
    .trim()
    .min(2, "La sede debe tener al menos 2 caracteres.")
    .max(200, "La sede no puede exceder 200 caracteres."),
  modalidad: z.enum(modalidadesEvento, {
    required_error: "La modalidad es obligatoria.",
    invalid_type_error: "Selecciona una modalidad válida.",
  }),
  costoCentavos: z
    .number({
      required_error: "El costo es obligatorio.",
      invalid_type_error: "El costo debe ser un número.",
    })
    .int("El costo debe expresarse en centavos (número entero).")
    .min(0, "El costo no puede ser negativo."),
  cupo: z
    .number({ invalid_type_error: "El cupo debe ser un número." })
    .int("El cupo debe ser un número entero.")
    .positive("El cupo debe ser mayor a cero.")
    .nullable()
    .optional(),
  estado: z.enum(estadosEvento, {
    required_error: "El estado es obligatorio.",
    invalid_type_error: "Selecciona un estado válido.",
  }),
  descripcion: z
    .string({ required_error: "La descripción es obligatoria." })
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(5000, "La descripción no puede exceder 5000 caracteres."),
  imagenPath: z.string().trim().max(500).nullable().optional(),
  publicado: z.boolean().default(false),
  registroAbierto: z.boolean().default(false),
});

export type EventoInput = z.infer<typeof eventoSchema>;
