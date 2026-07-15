/**
 * Proxy de Next 16 (sucesor de middleware.ts — misma semántica).
 * 1) Refresca la sesión de Supabase en cada petición (cookies SSR).
 * 2) Protege /admin/* (solo rol admin) y el micrositio privado /miembros/*
 *    (consejo/asociados/admin según sub-ruta).
 * Las rutas públicas pasan intactas: solo se les refresca la cookie.
 *
 * La verificación de rol aquí es la PRIMERA barrera (UX); la autorización
 * real de datos vive en requireRol() dentro de cada handler + RLS en la BD.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

/**
 * ¿Están configuradas las credenciales de Supabase? En un deploy sin las env
 * vars (p. ej. el primer despliegue en Vercel antes de tener proyecto Supabase),
 * `createServerClient` con cadenas vacías LANZA y tumbaría TODO el sitio —
 * incluidas las páginas públicas. Se comprueba antes de crear el cliente.
 */
function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
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

  // Sin backend de auth (Supabase no configurado): el sitio público debe
  // seguir sirviéndose; las rutas protegidas fallan CERRADO (al login), nunca
  // abiertas ni con un 500 que rompa toda la app.
  if (!supabaseConfigurado()) {
    if (!regla) return NextResponse.next({ request });
    return redirigirALogin(request);
  }

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          respuesta = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            respuesta.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // IMPORTANTE: getUser() refresca el token si expiró. No usar getSession()
  // aquí (no valida el JWT). No insertar lógica entre createServerClient y
  // getUser() que pueda cortar el refresco de cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!regla) {
    // Ruta pública: pasa intacta (con la sesión ya refrescada).
    return respuesta;
  }

  if (!user) {
    // Sin sesión → login, conservando a dónde quería ir.
    const redireccion = redirigirALogin(request);
    for (const cookie of respuesta.cookies.getAll()) {
      redireccion.cookies.set(cookie);
    }
    return redireccion;
  }

  // Rol efectivo: profiles.tipo (RLS permite leer el propio perfil)
  // + allowlist ADMIN_ALLOWED_EMAILS para admin.
  const { data: perfil } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .maybeSingle();

  const allowlist = parseAdminAllowlist(process.env.ADMIN_ALLOWED_EMAILS);
  const rol = rolEfectivo(perfil?.tipo, user.email, allowlist);

  if (!tienePermiso(rol, regla.roles)) {
    // Autenticado pero sin el rol requerido → 403 (no redirect en bucle).
    const prohibido = new NextResponse(
      "403 — Acceso denegado. Tu cuenta no tiene permisos para esta sección.",
      { status: 403, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
    for (const cookie of respuesta.cookies.getAll()) {
      prohibido.cookies.set(cookie);
    }
    return prohibido;
  }

  return respuesta;
}

export const config = {
  matcher: [
    /*
     * Todas las rutas excepto estáticos: refrescar sesión en todo el sitio
     * mantiene viva la cookie aunque el usuario navegue páginas públicas.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|css|js|map)$).*)",
  ],
};
