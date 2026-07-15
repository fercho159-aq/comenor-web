/**
 * Helpers de sesión y RBAC para Server Components, Server Actions y
 * Route Handlers, sobre better-auth (Neon Postgres). El rol vive en la
 * columna user.rol (src/db/schema.ts) y el rol admin exige además estar
 * en ADMIN_ALLOWED_EMAILS (allowlist).
 *
 * En el proxy usa src/lib/auth/permisos.ts + auth.api.getSession directamente
 * (este archivo depende de next/headers).
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  esRol,
  parseAdminAllowlist,
  rolEfectivo,
  tienePermiso,
  type Rol,
} from "@/lib/auth/permisos";
import { auth } from "@/lib/auth/config";

export type { Rol };
export { esRol, parseAdminAllowlist, rolEfectivo, tienePermiso };

/**
 * Usuario de la sesión (forma estable propia — NO el tipo interno de
 * better-auth). `user_metadata` se conserva por compatibilidad con los
 * consumidores que derivaban el nombre a mostrar (antes Supabase).
 */
export interface UsuarioSesion {
  id: string;
  email: string;
  /** Metadatos ligeros para UI (nombre a mostrar). */
  user_metadata: { nombre?: string; name?: string };
}

/** Usuario autenticado + su rol efectivo. */
export interface UsuarioConRol {
  user: UsuarioSesion;
  rol: Rol;
  /** Acceso directo (= user.id). */
  id: string;
  /** Acceso directo (= user.email). */
  email: string;
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
 * Sesión cruda de better-auth para la petición actual (valida el token de
 * sesión contra la BD), o null si no hay sesión o el servicio falla.
 * Falla CERRADA: cualquier error ⇒ null (nunca una sesión inventada).
 */
async function sesionActual(): Promise<{
  user: { id: string; email: string; name: string; rol?: unknown };
} | null> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion?.user) return null;
    return sesion;
  } catch {
    return null;
  }
}

/** Convierte el user de better-auth a la forma estable UsuarioSesion. */
function aUsuarioSesion(user: { id: string; email: string; name: string }): UsuarioSesion {
  return {
    id: user.id,
    email: user.email,
    user_metadata: { name: user.name, nombre: user.name },
  };
}

/**
 * Usuario autenticado de la petición actual, o null si no hay sesión.
 * La sesión se valida server-side contra la BD (better-auth), nunca se
 * confía en el contenido de la cookie sin verificar.
 */
export async function getSesion(): Promise<UsuarioSesion | null> {
  const sesion = await sesionActual();
  if (!sesion) return null;
  return aUsuarioSesion(sesion.user);
}

/**
 * Usuario + rol efectivo leyendo user.rol.
 * Devuelve null si: no hay sesión, el rol no es válido, o el rol es 'admin'
 * pero el correo no está en ADMIN_ALLOWED_EMAILS (falla cerrada).
 */
export async function getUsuarioConRol(): Promise<UsuarioConRol | null> {
  const sesion = await sesionActual();
  if (!sesion) return null;

  const allowlist = parseAdminAllowlist(process.env.ADMIN_ALLOWED_EMAILS);
  const rol = rolEfectivo(sesion.user.rol, sesion.user.email, allowlist);
  if (!rol) return null;

  const user = aUsuarioSesion(sesion.user);
  return { user, rol, id: user.id, email: user.email };
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
