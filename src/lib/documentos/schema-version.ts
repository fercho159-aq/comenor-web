/**
 * Esquema Zod para el guardado de versiones richtext (Tiptap) de un documento.
 *
 * No existe un esquema de versión en src/lib/schemas/ (esa carpeta pertenece a
 * A0); por eso vive aquí, en la carpeta del módulo documental. Se comparte
 * cliente/servidor y el route handler RE-VALIDA con él (validación doble).
 */
import { z } from "zod";

/** Cuerpo del POST que crea una nueva versión de contenido richtext. */
export const versionDocumentoSchema = z.object({
  contenidoRichtext: z
    .string({ required_error: "El contenido es obligatorio." })
    .trim()
    .min(1, "El contenido no puede estar vacío.")
    // Tope defensivo: Tiptap serializa a HTML; evita cargas abusivas.
    .max(500_000, "El contenido excede el tamaño máximo permitido."),
});

export type VersionDocumentoInput = z.infer<typeof versionDocumentoSchema>;
