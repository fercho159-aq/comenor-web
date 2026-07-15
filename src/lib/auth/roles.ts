/**
 * Helpers de sesión y RBAC para Server Components, Server Actions y
 * Route Handlers. El rol vive en profiles.tipo (src/db/schema.ts) y el
 * rol admin exige además estar en ADMIN_ALLOWED_EMAILS (allowlist).
 *
 * En middleware usa src/lib/auth/permisos.ts directamente (este archivo
 * depende de next/headers vía el cliente de servidor).
 */
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import {
  esRol,
  parseAdminAllowlist,
  rolEfectivo,
  tienePermiso,
  type Rol,
} from "@/lib/auth/permisos";
import { createClient } from "@/lib/supabase/server";

export type { Rol };
export { esRol, parseAdminAllowlist, rolEfectivo, tienePermiso };

/** Usuario autenticado + su rol efectivo. */
export interface UsuarioConRol {
  user: User;
  rol: Rol;
}

/** Opciones de requireRol. */
export interface RequireRolOpciones {
  /** Si se define, en vez de lanzar ErrorAutorizacion redirige a esta ruta. */
  redirigirA?: string;
}

/**
 * Error de autorización con código HTTP sugerido.
 * 401 = sin sesión · 403 = sesión sin el rol requerido.
 * Los route handlers deben atraparlo y responder con `status`.
 */
export class ErrorAutorizacion extends Error {
  constructor(
    public readonly status: 401 | 403,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorAutorizacion";
  }
}

/**
 * Usuario autenticado de la petición actual, o null si no hay sesión.
 * Usa auth.getUser() (valida el JWT contra Supabase), nunca getSession().
 */
export async function getSesion(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Usuario + rol efectivo leyendo profiles.tipo.
 * Devuelve null si: no hay sesión, no hay fila en profiles, el tipo no es
 * válido, o el tipo es 'admin' pero el correo no está en ADMIN_ALLOWED_EMAILS.
 */
export async function getUsuarioConRol(): Promise<UsuarioConRol | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const user = data.user;

  const { data: perfil, error: errorPerfil } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .maybeSingle();
  if (errorPerfil || !perfil) return null;

  const allowlist = parseAdminAllowlist(process.env.ADMIN_ALLOWED_EMAILS);
  const rol = rolEfectivo(perfil.tipo, user.email, allowlist);
  if (!rol) return null;

  return { user, rol };
}

/**
 * Exige que la petición tenga sesión con alguno de los roles indicados.
 *
 * - Sin sesión → ErrorAutorizacion(401) (o redirect si opciones.redirigirA).
 * - Sesión sin rol válido o con rol no permitido → ErrorAutorizacion(403)
 *   (o redirect si opciones.redirigirA).
 * - OK → devuelve { user, rol } para uso posterior (auditoría, queries).
 *
 * Uso en route handler:
 *   try { const { user } = await requireRol(["admin"]); ... }
 *   catch (e) { if (e instanceof ErrorAutorizacion) return NextResponse.json({ error: e.message }, { status: e.status }); throw e; }
 *
 * Uso en página/server component:
 *   const { user, rol } = await requireRol(["consejo", "admin"], { redirigirA: "/login" });
 */
export async function requireRol(
  roles: Rol[],
  opciones?: RequireRolOpciones,
): Promise<UsuarioConRol> {
  const usuario = await getUsuarioConRol();

  if (!usuario) {
    const sinSesion = (await getSesion()) === null;
    if (opciones?.redirigirA) redirect(opciones.redirigirA);
    throw new ErrorAutorizacion(
      sinSesion ? 401 : 403,
      sinSesion
        ? "Debes iniciar sesión para acceder a este recurso."
        : "Tu cuenta no tiene un rol autorizado para este recurso.",
    );
  }

  if (!tienePermiso(usuario.rol, roles)) {
    if (opciones?.redirigirA) redirect(opciones.redirigirA);
    throw new ErrorAutorizacion(
      403,
      "No tienes permisos suficientes para acceder a este recurso.",
    );
  }

  return usuario;
}
