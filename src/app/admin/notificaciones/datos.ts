/**
 * Lecturas a BD del módulo de destinatarios. SOLO SERVIDOR.
 */
import "server-only";

import { asc } from "drizzle-orm";

import { db } from "@/db";
import { emailRecipients, type EmailRecipient } from "@/db/schema";

/** Todos los destinatarios, ordenados por correo. */
export async function listarDestinatarios(): Promise<EmailRecipient[]> {
  return db
    .select()
    .from(emailRecipients)
    .orderBy(asc(emailRecipients.correo));
}
