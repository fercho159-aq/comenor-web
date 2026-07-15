/**
 * Esquemas Zod del módulo de destinatarios de notificaciones (email_recipients).
 * No existían en src/lib/schemas/, así que se definen junto a su consumidor.
 * Validación DOBLE: el formulario y la server action usan el mismo esquema.
 */
import { z } from "zod";

/** Perfiles válidos (espeja el enum `tipo_perfil` de Postgres). */
export const perfilesDestinatario = ["consejo", "asociados", "admin"] as const;
export type PerfilDestinatario = (typeof perfilesDestinatario)[number];

/** Alta/edición de un destinatario de notificaciones. */
export const destinatarioSchema = z.object({
  correo: z
    .string({ required_error: "El correo es obligatorio." })
    .trim()
    .toLowerCase()
    .min(1, "El correo es obligatorio.")
    .email("Ingresa un correo electrónico válido.")
    .max(320, "El correo no puede exceder 320 caracteres."),
  perfil: z.enum(perfilesDestinatario, {
    required_error: "El perfil es obligatorio.",
    invalid_type_error: "Selecciona un perfil válido.",
  }),
  activo: z.coerce.boolean().default(true),
});

export type DestinatarioInput = z.infer<typeof destinatarioSchema>;
/** Tipo de los valores del formulario (entrada del esquema, antes de coerción). */
export type DestinatarioFormValues = z.input<typeof destinatarioSchema>;
