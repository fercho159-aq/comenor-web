/**
 * Reglas de rol PURAS (sin Next, sin Supabase, sin I/O).
 * Se comparten entre src/lib/auth/roles.ts (server components / handlers)
 * y src/proxy.ts (middleware), y se prueban de forma aislada con vitest.
 *
 * El rol vive en la columna `tipo` de la tabla `profiles` (src/db/schema.ts).
 */

/** Rol de usuario — espeja el enum tipo_perfil de la BD. */
export type Rol = "consejo" | "asociados" | "admin";

/** Lista canónica de roles válidos. */
export const ROLES: readonly Rol[] = ["consejo", "asociados", "admin"] as const;

/** Type guard: ¿el valor es un rol válido? */
export function esRol(valor: unknown): valor is Rol {
  return typeof valor === "string" && (ROLES as readonly string[]).includes(valor);
}

/**
 * Parsea ADMIN_ALLOWED_EMAILS (lista separada por comas) a correos
 * normalizados (minúsculas, sin espacios). Vacío o ausente ⇒ lista vacía
 * ⇒ NADIE es admin (falla cerrada).
 */
export function parseAdminAllowlist(valor: string | undefined): string[] {
  if (!valor) return [];
  return valor
    .split(",")
    .map((correo) => correo.trim().toLowerCase())
    .filter((correo) => correo.length > 0);
}

/** ¿El correo está en la allowlist de administración? (case-insensitive) */
export function esAdminPermitido(
  correo: string | null | undefined,
  allowlist: string[],
): boolean {
  if (!correo) return false;
  return allowlist.includes(correo.trim().toLowerCase());
}

/**
 * Rol efectivo de un usuario a partir de su perfil y su correo.
 *
 * Regla de seguridad: `profiles.tipo = 'admin'` NO basta — el correo además
 * debe estar en ADMIN_ALLOWED_EMAILS. Un perfil admin cuyo correo salió de
 * la allowlist queda SIN rol (null): defensa contra escalación por BD.
 *
 * @param tipo    Valor crudo de profiles.tipo (puede venir sucio de la BD).
 * @param correo  Correo del usuario autenticado (auth.users.email).
 * @param allowlist  Resultado de parseAdminAllowlist(process.env.ADMIN_ALLOWED_EMAILS).
 * @returns El rol efectivo, o null si no tiene rol válido.
 */
export function rolEfectivo(
  tipo: unknown,
  correo: string | null | undefined,
  allowlist: string[],
): Rol | null {
  if (!esRol(tipo)) return null;
  if (tipo === "admin" && !esAdminPermitido(correo, allowlist)) return null;
  return tipo;
}

/** ¿El rol está dentro de los permitidos? */
export function tienePermiso(rol: Rol | null, permitidos: readonly Rol[]): boolean {
  return rol !== null && permitidos.includes(rol);
}
