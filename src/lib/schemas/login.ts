import { z } from "zod";

/** Inicio de sesión (consejo, asociados y administración). */
export const loginSchema = z.object({
  correo: z
    .string({ required_error: "El correo electrónico es obligatorio." })
    .trim()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un correo electrónico válido.")
    .max(254, "El correo no puede exceder 254 caracteres."),
  password: z
    .string({ required_error: "La contraseña es obligatoria." })
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no puede exceder 128 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;
