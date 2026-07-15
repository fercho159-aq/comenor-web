/**
 * Deriva el nombre a mostrar en el encabezado del panel a partir del usuario de
 * Supabase. Usa `user_metadata.nombre`/`name` si existen; si no, la parte local
 * del correo; y como último recurso, "Administrador".
 */
import type { User } from "@supabase/supabase-js";

export function nombrePanel(user: User): string {
  const meta = user.user_metadata as {
    nombre?: unknown;
    name?: unknown;
  } | null;
  const desdeMeta =
    typeof meta?.nombre === "string"
      ? meta.nombre
      : typeof meta?.name === "string"
        ? meta.name
        : null;
  return desdeMeta ?? user.email?.split("@")[0] ?? "Administrador";
}
