/**
 * Proxy de Next 16 (sucesor de middleware.ts — corre en runtime Node).
 * Valida la sesión de better-auth SERVER-SIDE (contra la BD, nunca confiando
 * en la cookie sin verificar) y protege /admin/* (solo rol admin) y el
 * micrositio privado /miembros/* (consejo/asociados/admin según sub-ruta).
 * Las rutas públicas pasan intactas.
 *
 * La verificación de rol aquí es la PRIMERA barrera (UX); la autorización
 * real de datos vive en requireRol() dentro de cada handler.
 */
import { NextResponse, type NextRequest } from "next/server";

import { auth, authConfigurado } from "@/lib/auth/config";
import {
  parseAdminAllowlist,
  rolEfectivo,
  tienePermiso,
  type Rol,
} from "@/lib/auth/permisos";

/** Ruta de inicio de sesión del micrositio. */
const RUTA_LOGIN = "/login";

/**
 * Prefijos protegidos y roles permitidos. El PRIMER prefijo que coincida
 * gana (por eso las sub-rutas van antes que /miembros genérico).
 */
const RUTAS_PROTEGIDAS: ReadonlyArray<{ prefijo: string; roles: readonly Rol[] }> = [
  { prefijo: "/admin", roles: ["admin"] },
  { prefijo: "/miembros/consejo", roles: ["consejo", "admin"] },
  { prefijo: "/miembros/asociados", roles: ["asociados", "admin"] },
  { prefijo: "/miembros", roles: ["consejo", "asociados", "admin"] },
];

function reglaPara(pathname: string): { prefijo: string; roles: readonly Rol[] } | null {
  for (const regla of RUTAS_PROTEGIDAS) {
    if (pathname === regla.prefijo || pathname.startsWith(`${regla.prefijo}/`)) {
      return regla;
    }
  }
  return null;
}

/** Redirige al login conservando el destino pretendido. */
function redirigirALogin(request: NextRequest): NextResponse {
  const urlLogin = request.nextUrl.clone();
  urlLogin.pathname = RUTA_LOGIN;
  urlLogin.search = "";
  urlLogin.searchParams.set(
    "siguiente",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(urlLogin);
}

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const regla = reglaPara(request.nextUrl.pathname);

  // Ruta pública: pasa intacta. better-auth mantiene su cookie de sesión desde
  // sus propios endpoints (/api/auth/*); aquí no hay nada que refrescar.
  if (!regla) return NextResponse.next({ request });

  // Sin backend de auth (faltan BETTER_AUTH_SECRET / DATABASE_URL): el sitio
  // público debe seguir sirviéndose; las rutas protegidas fallan CERRADO
  // (al login), nunca abiertas ni con un 500 que rompa toda la app.
  if (!authConfigurado()) return redirigirALogin(request);

  // Sesión validada server-side contra la BD. Cualquier error del servicio
  // ⇒ tratar como sin sesión (falla cerrada).
  let sesion: Awaited<ReturnType<typeof auth.api.getSession>> = null;
  try {
    sesion = await auth.api.getSession({ headers: request.headers });
  } catch {
    sesion = null;
  }

  if (!sesion?.user) {
    // Sin sesión → login, conservando a dónde quería ir.
    return redirigirALogin(request);
  }

  // Rol efectivo: user.rol + allowlist ADMIN_ALLOWED_EMAILS para admin.
  const allowlist = parseAdminAllowlist(process.env.ADMIN_ALLOWED_EMAILS);
  const rol = rolEfectivo(sesion.user.rol, sesion.user.email, allowlist);

  if (!tienePermiso(rol, regla.roles)) {
    // Autenticado pero sin el rol requerido → 403 (no redirect en bucle).
    return new NextResponse(
      "403 — Acceso denegado. Tu cuenta no tiene permisos para esta sección.",
      { status: 403, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  return NextResponse.next({ request });
}

export const config = {
  // better-auth necesita Node (conexión Postgres a Neon); en Next 16 el proxy
  // SIEMPRE corre en Node — declarar `runtime` aquí está prohibido y rompe
  // el build ("Route segment config is not allowed in Proxy file").
  matcher: [
    /*
     * Solo las zonas protegidas: la validación consulta la BD, no tiene
     * sentido pagarla en cada página pública ni en estáticos.
     */
    "/admin/:path*",
    "/miembros/:path*",
  ],
};
