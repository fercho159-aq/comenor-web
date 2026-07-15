/**
 * Tipos compartidos por las vistas del panel documental. Espejan la forma que
 * devuelven los route handlers de `src/app/api/documentos` (no se redefine la
 * lógica de negocio; solo el contrato de datos que consume la UI).
 */
import type { NivelAcceso } from "@/lib/documentos/acceso";

/** Fila del listado — respuesta de GET /api/documentos. */
export interface DocumentoListado {
  id: string;
  titulo: string;
  mes: number;
  anio: number;
  nivelAcceso: NivelAcceso;
  tipo: string;
  formato: string;
  createdAt: string;
}

/** Versión richtext — respuesta de GET /api/documentos/[id]/versiones. */
export interface VersionDocumento {
  id: string;
  version: number;
  contenidoRichtext: string;
  editadoPor: string;
  createdAt: string;
}

/** Forma de error uniforme de los route handlers (400 con error por campo). */
export interface ErrorApi {
  mensaje?: string;
  errores?: Record<string, string[] | undefined>;
}
