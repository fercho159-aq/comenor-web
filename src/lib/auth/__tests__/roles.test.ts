/**
 * Tests de RBAC (PLAN.md §2): requireRol permite el rol correcto y rechaza
 * el incorrecto, con la sesión de Supabase mockeada (sin servicios vivos).
 */
import type { User } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  esAdminPermitido,
  parseAdminAllowlist,
  rolEfectivo,
  tienePermiso,
} from "@/lib/auth/permisos";

// --- Mocks -----------------------------------------------------------------

const redirectMock = vi.hoisted(() =>
  vi.fn((url: string): never => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
);

vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({ createClient: createClientMock }));

import { ErrorAutorizacion, getSesion, getUsuarioConRol, requireRol } from "@/lib/auth/roles";

interface EscenarioSesion {
  user: Partial<User> | null;
  tipoPerfil?: string | null;
}

/** Construye un cliente Supabase falso para un escenario de sesión. */
function simularSesion({ user, tipoPerfil = null }: EscenarioSesion): void {
  createClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue(
        user
          ? { data: { user }, error: null }
          : { data: { user: null }, error: { message: "Auth session missing!" } },
      ),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue(
            tipoPerfil === null
              ? { data: null, error: null }
              : { data: { tipo: tipoPerfil }, error: null },
          ),
        }),
      }),
    }),
  });
}

const USUARIO_BASE: Partial<User> = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "persona@ejemplo.mx",
};

beforeEach(() => {
  vi.stubEnv("ADMIN_ALLOWED_EMAILS", "admin@comenor.org.mx, direccion@comenor.org.mx");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

// --- requireRol --------------------------------------------------------------

describe("requireRol", () => {
  it("permite el acceso cuando el rol del perfil está en la lista", async () => {
    simularSesion({ user: USUARIO_BASE, tipoPerfil: "consejo" });

    const usuario = await requireRol(["consejo", "admin"]);

    expect(usuario.rol).toBe("consejo");
    expect(usuario.user.id).toBe(USUARIO_BASE.id);
  });

  it("rechaza con 403 cuando el rol no está permitido", async () => {
    simularSesion({ user: USUARIO_BASE, tipoPerfil: "asociados" });

    const intento = requireRol(["consejo"]);

    await expect(intento).rejects.toBeInstanceOf(ErrorAutorizacion);
    await expect(requireRol(["consejo"])).rejects.toMatchObject({ status: 403 });
  });

  it("rechaza con 401 cuando no hay sesión", async () => {
    simularSesion({ user: null });

    await expect(requireRol(["admin"])).rejects.toMatchObject({ status: 401 });
  });

  it("permite admin solo si el correo está en ADMIN_ALLOWED_EMAILS", async () => {
    simularSesion({
      user: { ...USUARIO_BASE, email: "admin@comenor.org.mx" },
      tipoPerfil: "admin",
    });

    const usuario = await requireRol(["admin"]);

    expect(usuario.rol).toBe("admin");
  });

  it("rechaza un perfil admin cuyo correo NO está en la allowlist (falla cerrada)", async () => {
    simularSesion({
      user: { ...USUARIO_BASE, email: "intruso@ejemplo.mx" },
      tipoPerfil: "admin",
    });

    await expect(requireRol(["admin"])).rejects.toMatchObject({ status: 403 });
  });

  it("rechaza con 403 cuando el usuario no tiene fila en profiles", async () => {
    simularSesion({ user: USUARIO_BASE, tipoPerfil: null });

    await expect(requireRol(["asociados"])).rejects.toMatchObject({ status: 403 });
  });

  it("redirige en vez de lanzar cuando se pasa redirigirA", async () => {
    simularSesion({ user: null });

    await expect(
      requireRol(["admin"], { redirigirA: "/login" }),
    ).rejects.toThrowError("NEXT_REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});

// --- getSesion / getUsuarioConRol -------------------------------------------

describe("getSesion", () => {
  it("devuelve el usuario cuando hay sesión válida", async () => {
    simularSesion({ user: USUARIO_BASE, tipoPerfil: "asociados" });

    const user = await getSesion();

    expect(user?.email).toBe("persona@ejemplo.mx");
  });

  it("devuelve null sin sesión", async () => {
    simularSesion({ user: null });

    expect(await getSesion()).toBeNull();
  });
});

describe("getUsuarioConRol", () => {
  it("devuelve el rol leído de profiles.tipo", async () => {
    simularSesion({ user: USUARIO_BASE, tipoPerfil: "asociados" });

    const usuario = await getUsuarioConRol();

    expect(usuario).not.toBeNull();
    expect(usuario?.rol).toBe("asociados");
  });

  it("devuelve null si profiles.tipo trae un valor inválido", async () => {
    simularSesion({ user: USUARIO_BASE, tipoPerfil: "superusuario" });

    expect(await getUsuarioConRol()).toBeNull();
  });
});

// --- Helpers puros -----------------------------------------------------------

describe("permisos (helpers puros)", () => {
  it("parseAdminAllowlist normaliza espacios y mayúsculas", () => {
    expect(parseAdminAllowlist(" Admin@Comenor.org.mx , otro@x.mx ,")).toEqual([
      "admin@comenor.org.mx",
      "otro@x.mx",
    ]);
    expect(parseAdminAllowlist(undefined)).toEqual([]);
    expect(parseAdminAllowlist("")).toEqual([]);
  });

  it("esAdminPermitido es case-insensitive y falla cerrada", () => {
    const lista = parseAdminAllowlist("admin@comenor.org.mx");
    expect(esAdminPermitido("ADMIN@comenor.org.MX", lista)).toBe(true);
    expect(esAdminPermitido("otro@comenor.org.mx", lista)).toBe(false);
    expect(esAdminPermitido(null, lista)).toBe(false);
    expect(esAdminPermitido("admin@comenor.org.mx", [])).toBe(false);
  });

  it("rolEfectivo degrada admin fuera de la allowlist a null", () => {
    const lista = ["admin@comenor.org.mx"];
    expect(rolEfectivo("admin", "admin@comenor.org.mx", lista)).toBe("admin");
    expect(rolEfectivo("admin", "otro@x.mx", lista)).toBeNull();
    expect(rolEfectivo("consejo", "otro@x.mx", lista)).toBe("consejo");
    expect(rolEfectivo("inventado", "otro@x.mx", lista)).toBeNull();
  });

  it("tienePermiso valida pertenencia y rechaza null", () => {
    expect(tienePermiso("admin", ["admin"])).toBe(true);
    expect(tienePermiso("asociados", ["consejo", "admin"])).toBe(false);
    expect(tienePermiso(null, ["admin"])).toBe(false);
  });
});
