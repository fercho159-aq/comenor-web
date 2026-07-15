"use server";

/**
 * Server Actions del panel admin de eventos.
 *
 * El panel es UI: estas acciones son la capa servidor del CRUD (no existe un
 * route handler de administración de eventos que duplicar). Reglas:
 *  - Autorización SIEMPRE con `requireRol(["admin"])` antes de tocar datos.
 *  - Validación DOBLE: el cliente valida con `eventoSchema`; aquí se RE-VALIDA
 *    con el mismo esquema compartido (`validarEvento`).
 *  - La imagen se procesa con sharp y se sube al bucket público de eventos.
 *  - Publicar/despublicar y abrir/cerrar registro NO borran datos: sólo
 *    alternan banderas booleanas.
 */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { auditLog, events } from "@/db/schema";
import { ErrorAutorizacion, requireRol } from "@/lib/auth/roles";
import type { EventoInput } from "@/lib/schemas";
import { subirObjeto, urlPublica } from "@/lib/storage/objetos";

import { procesarImagenEvento } from "./imagen";
import {
  BUCKET_EVENTOS,
  construirImagenPathEvento,
  esBanderaEvento,
  leerCamposEvento,
  normalizarFechaLocalCDMX,
  validarArchivoImagen,
  validarEvento,
  type CamposCrudosEvento,
} from "./logica";
import { buscarEventoPorId } from "./_datos";

/** Estado que las acciones de formulario devuelven a `useActionState`. */
export interface EstadoFormularioEvento {
  ok: boolean;
  /** Mensaje general (éxito parcial o error no ligado a un campo). */
  mensaje?: string;
  /** Errores por campo (de Zod o de reglas de negocio) para pintarlos inline. */
  errores?: Record<string, string[]>;
}

const RUTA_ADMIN = "/admin/eventos";
const RUTA_PUBLICA = "/eventos";

/** Revalida las vistas que dependen de los eventos (panel y calendario). */
function revalidarEventos(): void {
  revalidatePath(RUTA_ADMIN);
  revalidatePath(RUTA_PUBLICA);
}

/** Bitácora de auditoría (best-effort: un fallo aquí no rompe la operación). */
async function registrarAuditoria(
  actor: string,
  accion: string,
  entidadId: string,
): Promise<void> {
  try {
    await db.insert(auditLog).values({
      actor,
      accion,
      entidad: "evento",
      entidadId,
    });
  } catch {
    // La auditoría es secundaria; no debe abortar el CRUD.
  }
}

/**
 * Procesa (sharp) y sube la portada al bucket público, devolviendo su URL.
 * La autorización ya se resolvió con `requireRol` antes de llamar aquí.
 */
async function subirPortada(id: string, archivo: File): Promise<string> {
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const procesada = await procesarImagenEvento(bytes);

  const path = construirImagenPathEvento(id);
  await subirObjeto(BUCKET_EVENTOS, path, procesada, {
    contentType: "image/webp",
    sobrescribir: true,
  });
  return urlPublica(BUCKET_EVENTOS, path);
}

/** ¿El error de Postgres es una violación de índice único (slug repetido)? */
function esConflictoUnico(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

/** Valores comunes para insert/update derivados de la validación. */
function valoresEvento(datos: EventoInput, imagenPath: string | null) {
  return {
    nombre: datos.nombre,
    slug: datos.slug,
    fecha: datos.fecha,
    sede: datos.sede,
    modalidad: datos.modalidad,
    costoCentavos: datos.costoCentavos,
    cupo: datos.cupo ?? null,
    estado: datos.estado,
    descripcion: datos.descripcion,
    imagenPath,
    publicado: datos.publicado,
    registroAbierto: datos.registroAbierto,
  };
}

/** Extrae y pre-valida el archivo de imagen del formulario, si viene. */
function leerImagen(formData: FormData):
  | { hay: false }
  | { hay: true; archivo: File }
  | { hay: false; error: string } {
  const archivo = formData.get("imagen");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { hay: false };
  }
  const error = validarArchivoImagen(archivo);
  if (error) return { hay: false, error };
  return { hay: true, archivo };
}

/** Normaliza la fecha del `datetime-local` a hora de CDMX antes de validar. */
function prepararCampos(formData: FormData): CamposCrudosEvento {
  const campos = leerCamposEvento(formData);
  campos.fecha = normalizarFechaLocalCDMX(campos.fecha);
  return campos;
}

/**
 * Crea un evento nuevo. Inserta primero (para tener el id) y, si hay portada,
 * la sube y actualiza `imagenPath`. Si el evento se crea pero la imagen falla,
 * el evento queda creado sin portada y se informa (no se pierde el trabajo).
 */
export async function crearEvento(
  _prev: EstadoFormularioEvento,
  formData: FormData,
): Promise<EstadoFormularioEvento> {
  let usuarioId: string;
  try {
    const { user } = await requireRol(["admin"]);
    usuarioId = user.id;
  } catch (error) {
    if (error instanceof ErrorAutorizacion) {
      return { ok: false, mensaje: error.message };
    }
    throw error;
  }

  const imagen = leerImagen(formData);
  if ("error" in imagen && imagen.error) {
    return { ok: false, errores: { imagen: [imagen.error] } };
  }

  const campos = prepararCampos(formData);
  const validacion = validarEvento(campos, null);
  if (!validacion.ok) {
    return { ok: false, errores: validacion.errores };
  }

  let nuevoId: string;
  try {
    const [fila] = await db
      .insert(events)
      .values(valoresEvento(validacion.datos, null))
      .returning({ id: events.id });
    nuevoId = fila.id;
  } catch (error) {
    if (esConflictoUnico(error)) {
      return {
        ok: false,
        errores: { slug: ["Ya existe un evento con ese slug."] },
      };
    }
    throw error;
  }

  let avisoImagen: string | undefined;
  if (imagen.hay) {
    try {
      const url = await subirPortada(nuevoId, imagen.archivo);
      await db
        .update(events)
        .set({ imagenPath: url, updatedAt: new Date() })
        .where(eq(events.id, nuevoId));
    } catch {
      avisoImagen =
        "El evento se creó, pero la portada no pudo subirse. Edítalo para reintentar.";
    }
  }

  await registrarAuditoria(usuarioId, "crear", nuevoId);
  revalidarEventos();

  if (avisoImagen) {
    // No redirigimos: el operador debe ver el aviso y reintentar la portada.
    return { ok: true, mensaje: avisoImagen };
  }
  redirect(RUTA_ADMIN);
}

/**
 * Actualiza un evento existente. Preserva la portada actual salvo que se suba
 * una nueva. No toca los registros ni el historial de pagos.
 */
export async function actualizarEvento(
  id: string,
  _prev: EstadoFormularioEvento,
  formData: FormData,
): Promise<EstadoFormularioEvento> {
  let usuarioId: string;
  try {
    const { user } = await requireRol(["admin"]);
    usuarioId = user.id;
  } catch (error) {
    if (error instanceof ErrorAutorizacion) {
      return { ok: false, mensaje: error.message };
    }
    throw error;
  }

  const existente = await buscarEventoPorId(id);
  if (!existente) {
    return { ok: false, mensaje: "El evento no existe o fue eliminado." };
  }

  const imagen = leerImagen(formData);
  if ("error" in imagen && imagen.error) {
    return { ok: false, errores: { imagen: [imagen.error] } };
  }

  const campos = prepararCampos(formData);
  const validacion = validarEvento(campos, existente.imagenPath);
  if (!validacion.ok) {
    return { ok: false, errores: validacion.errores };
  }

  let imagenPath = existente.imagenPath;
  if (imagen.hay) {
    try {
      imagenPath = await subirPortada(id, imagen.archivo);
    } catch {
      return {
        ok: false,
        errores: {
          imagen: ["No se pudo subir la nueva portada. Intenta de nuevo."],
        },
      };
    }
  }

  try {
    await db
      .update(events)
      .set({ ...valoresEvento(validacion.datos, imagenPath), updatedAt: new Date() })
      .where(eq(events.id, id));
  } catch (error) {
    if (esConflictoUnico(error)) {
      return {
        ok: false,
        errores: { slug: ["Ya existe un evento con ese slug."] },
      };
    }
    throw error;
  }

  await registrarAuditoria(usuarioId, "editar", id);
  revalidarEventos();
  redirect(RUTA_ADMIN);
}

/**
 * Alterna una bandera booleana del evento (publicado / registroAbierto) sin
 * borrar datos. Pensada como `action` de un `<form>` en la tabla del panel:
 * lee `id`, `campo` y `valor` de campos ocultos.
 */
export async function establecerBanderaEvento(
  formData: FormData,
): Promise<void> {
  let usuarioId: string;
  try {
    const { user } = await requireRol(["admin"]);
    usuarioId = user.id;
  } catch (error) {
    if (error instanceof ErrorAutorizacion) return;
    throw error;
  }

  const id = formData.get("id");
  const campo = formData.get("campo");
  const valor = formData.get("valor") === "true";
  if (typeof id !== "string" || !esBanderaEvento(campo)) {
    return;
  }

  const cambios =
    campo === "publicado"
      ? { publicado: valor, updatedAt: new Date() }
      : { registroAbierto: valor, updatedAt: new Date() };

  await db.update(events).set(cambios).where(eq(events.id, id));
  await registrarAuditoria(
    usuarioId,
    campo === "publicado"
      ? valor
        ? "publicar"
        : "despublicar"
      : valor
        ? "abrir_registro"
        : "cerrar_registro",
    id,
  );
  revalidarEventos();
}
