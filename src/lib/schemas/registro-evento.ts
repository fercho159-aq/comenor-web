import { z } from "zod";

/**
 * Registro a un evento — esquema COMPARTIDO cliente/servidor.
 * El route handler re-valida con este mismo esquema (validación doble).
 * La BD además exige NOT NULL en todos los campos de contacto.
 */
export const registroEventoSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre no puede exceder 120 caracteres."),
  cargo: z
    .string({ required_error: "El cargo es obligatorio." })
    .trim()
    .min(2, "El cargo debe tener al menos 2 caracteres.")
    .max(120, "El cargo no puede exceder 120 caracteres."),
  correo: z
    .string({ required_error: "El correo electrónico es obligatorio." })
    .trim()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un correo electrónico válido.")
    .max(254, "El correo no puede exceder 254 caracteres."),
  celular: z
    .string({ required_error: "El celular es obligatorio." })
    .trim()
    .regex(/^\d{10}$/, "El celular debe tener exactamente 10 dígitos."),
  organismo: z
    .string({ required_error: "El organismo es obligatorio." })
    .trim()
    .min(2, "El organismo debe tener al menos 2 caracteres.")
    .max(200, "El organismo no puede exceder 200 caracteres."),
  solicitante: z
    .string({ required_error: "El solicitante es obligatorio." })
    .trim()
    .min(2, "El solicitante debe tener al menos 2 caracteres.")
    .max(120, "El solicitante no puede exceder 120 caracteres."),
});

export type RegistroEventoInput = z.infer<typeof registroEventoSchema>;
