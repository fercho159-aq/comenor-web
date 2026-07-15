/**
 * Lecturas a base de datos para las notificaciones documentales.
 * Aisladas del orquestador (`enviar.ts`) y de los route handlers para que la
 * lógica de negocio (selección de destinatarios) sea pura y testeable con
 * mocks, mientras estas funciones se mockean por completo en los tests.
 *
 * Solo servidor: `@/db` abre conexión a Postgres (requiere DATABASE_URL).
 */
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  documents,
  emailRecipients,
  type Document,
  type EmailRecipient,
} from "@/db/schema";

/** Documento por id, o `null` si no existe. */
export async function obtenerDocumento(id: string): Promise<Document | null> {
  const filas = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  return filas[0] ?? null;
}

/** Destinatarios activos de notificaciones documentales. */
export async function obtenerDestinatariosActivos(): Promise<EmailRecipient[]> {
  return db
    .select()
    .from(emailRecipients)
    .where(eq(emailRecipients.activo, true));
}
