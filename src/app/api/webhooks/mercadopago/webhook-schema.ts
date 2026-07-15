import { z } from "zod";

/**
 * Esquema Zod del cuerpo de una notificación de Mercado Pago (PLAN.md §2.3).
 *
 * Mercado Pago manda varios formatos (payment, merchant_order, plan, …) y a
 * veces el `data.id` viaja en el query string (`?data.id=...&type=payment`) en
 * lugar del body. Por eso casi todos los campos son opcionales aquí y el route
 * handler resuelve el `data.id` combinando query + body (validación doble: este
 * esquema RE-VALIDA la forma; el handler exige que exista un id de pago).
 *
 * `passthrough()` conserva campos extra para registrarlos íntegros en
 * `payments_log.payload_json` (auditoría).
 */
export const mercadoPagoWebhookSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    live_mode: z.boolean().optional(),
    type: z.string().optional(),
    topic: z.string().optional(),
    action: z.string().optional(),
    date_created: z.string().optional(),
    user_id: z.union([z.string(), z.number()]).optional(),
    api_version: z.string().optional(),
    data: z
      .object({
        id: z.union([z.string(), z.number()]).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type MercadoPagoWebhook = z.infer<typeof mercadoPagoWebhookSchema>;
