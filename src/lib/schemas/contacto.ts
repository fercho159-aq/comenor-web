import { z } from "zod";

/** Formulario de contacto público — esquema compartido cliente/servidor. */
export const contactoSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre no puede exceder 120 caracteres."),
  correo: z
    .string({ required_error: "El correo electrónico es obligatorio." })
    .trim()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un correo electrónico válido.")
    .max(254, "El correo no puede exceder 254 caracteres."),
  telefono: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos.")
    .optional()
    .or(z.literal("")),
  asunto: z
    .string({ required_error: "El asunto es obligatorio." })
    .trim()
    .min(3, "El asunto debe tener al menos 3 caracteres.")
    .max(200, "El asunto no puede exceder 200 caracteres."),
  mensaje: z
    .string({ required_error: "El mensaje es obligatorio." })
    .trim()
    .min(10, "El mensaje debe tener al menos 10 caracteres.")
    .max(2000, "El mensaje no puede exceder 2000 caracteres."),
});

export type ContactoInput = z.infer<typeof contactoSchema>;
