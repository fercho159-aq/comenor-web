"use server";

/**
 * Server Actions del módulo de destinatarios de notificaciones (email_recipients).
 *
 * No hay route handler para el CRUD de destinatarios (solo existe
 * `POST /api/notificaciones/documento`, que *consume* la tabla). La gestión
 * (alta/baja/perfil/activo) se implementa aquí, colocada con su UI y detrás de
 * `requireRol(["admin"])`. SOLO SERVIDOR.
 */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { auditLog, emailRecipients } from "@/db/schema";
import { ErrorAutorizacion, requireRol } from "@/lib/auth/roles";

import { destinatarioSchema } from "./schemas";

export type ResultadoAccion =
  | { ok: true; mensaje: string; id?: string }
  | { ok: false; mensaje: string; errores?: Record<string, string[]> };

const RUTA = "/admin/notificaciones";

async function autorizar(): Promise<
  { ok: true; actorId: string } | { ok: false; resultado: ResultadoAccion }
> {
  try {
    const { user } = await requireRol(["admin"]);
    return { ok: true, actorId: user.id };
  } catch (e) {
    if (e instanceof ErrorAutorizacion) {
      return { ok: false, resultado: { ok: false, mensaje: e.message } };
    }
    throw e;
  }
}

/** ¿El error es una violación de unicidad de Postgres (correo duplicado)? */
function esCorreoDuplicado(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

async function registrarAuditoria(
  actorId: string,
  accion: string,
  entidadId: string,
): Promise<void> {
  try {
    await db.insert(auditLog).values({
      actor: actorId,
      accion,
      entidad: "email_recipient",
      entidadId,
    });
  } catch {
    // Auditoría best-effort.
  }
}

/** Da de alta un destinatario. Correo duplicado ⇒ error por campo. */
export async function crearDestinatario(
  formData: FormData,
): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  const parsed = destinatarioSchema.safeParse({
    correo: formData.get("correo"),
    perfil: formData.get("perfil"),
    activo:
      formData.get("activo") === "on" || formData.get("activo") === "true",
  });
  if (!parsed.success) {
    return {
      ok: false,
      mensaje: "Revisa los campos marcados.",
      errores: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const [creado] = await db
      .insert(emailRecipients)
      .values({
        correo: parsed.data.correo,
        perfil: parsed.data.perfil,
        activo: parsed.data.activo,
      })
      .returning({ id: emailRecipients.id });

    await registrarAuditoria(auth.actorId, "recipient.create", creado.id);
    revalidatePath(RUTA);
    return { ok: true, mensaje: "Destinatario agregado.", id: creado.id };
  } catch (err) {
    if (esCorreoDuplicado(err)) {
      return {
        ok: false,
        mensaje: "Ese correo ya está registrado.",
        errores: { correo: ["Ese correo ya está registrado."] },
      };
    }
    throw err;
  }
}

/** Actualiza el perfil y/o estado activo de un destinatario. */
export async function actualizarDestinatario(
  id: string,
  formData: FormData,
): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  const parsed = destinatarioSchema.safeParse({
    correo: formData.get("correo"),
    perfil: formData.get("perfil"),
    activo:
      formData.get("activo") === "on" || formData.get("activo") === "true",
  });
  if (!parsed.success) {
    return {
      ok: false,
      mensaje: "Revisa los campos marcados.",
      errores: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await db
      .update(emailRecipients)
      .set({
        correo: parsed.data.correo,
        perfil: parsed.data.perfil,
        activo: parsed.data.activo,
      })
      .where(eq(emailRecipients.id, id));

    await registrarAuditoria(auth.actorId, "recipient.update", id);
    revalidatePath(RUTA);
    return { ok: true, mensaje: "Destinatario actualizado." };
  } catch (err) {
    if (esCorreoDuplicado(err)) {
      return {
        ok: false,
        mensaje: "Ese correo ya está registrado.",
        errores: { correo: ["Ese correo ya está registrado."] },
      };
    }
    throw err;
  }
}

/** Alta/baja lógica: alterna el campo `activo`. */
export async function alternarActivo(
  id: string,
  activo: boolean,
): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  await db
    .update(emailRecipients)
    .set({ activo })
    .where(eq(emailRecipients.id, id));

  await registrarAuditoria(
    auth.actorId,
    activo ? "recipient.activate" : "recipient.deactivate",
    id,
  );
  revalidatePath(RUTA);
  return {
    ok: true,
    mensaje: activo ? "Destinatario activado." : "Destinatario dado de baja.",
  };
}

/** Elimina un destinatario de forma permanente. */
export async function eliminarDestinatario(
  id: string,
): Promise<ResultadoAccion> {
  const auth = await autorizar();
  if (!auth.ok) return auth.resultado;

  await db.delete(emailRecipients).where(eq(emailRecipients.id, id));

  await registrarAuditoria(auth.actorId, "recipient.delete", id);
  revalidatePath(RUTA);
  return { ok: true, mensaje: "Destinatario eliminado." };
}
