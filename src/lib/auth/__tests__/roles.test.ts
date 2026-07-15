/**
 * Tests de RBAC (PLAN.md §2): requireRol permite el rol correcto y rechaza
 * el incorrecto, con la sesión de better-auth mockeada (sin servicios vivos).
 */
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

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

/** Mock de auth.api.getSession (la única superficie de config que usa roles.ts). */
const getSessionMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/config", () => ({
  auth: { api: { getSession: getSessionMock } },
  authConfigurado: () => true,
}));

import { ErrorAutorizacion, getSesion, getUsuarioConRol, requireRol } from "@/lib/auth/roles";

interface EscenarioSesion {
  /** Usuario de la sesión better-auth, o null para "sin sesión". */
  user: { id: string; email: string; name?: string; rol?: unknown } | null;
}

/** Simula lo que devolvería auth.api.getSession para un escenario. */
function simularSesion({ user }: EscenarioSesion): void {
  getSessionMock.mockResolvedValue(
    user
      ? { session: { id: "ses-1", userId: user.id }, user: { name: "", ...user } }
      : null,
  );
}

const USUARIO_BASE = {
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
  it("permite el acceso cuando user.rol está en la lista", async () => {
    simularSesion({ user: { ...USUARIO_BASE, rol: "consejo" } });

    const usuario = await requireRol(["consejo", "admin"]);

    expect(usuario.rol).toBe("consejo");
    expect(usuario.user.id).toBe(USUARIO_BASE.id);
    expect(usuario.id).toBe(USUARIO_BASE.id);
    expect(usuario.email).toBe(USUARIO_BASE.email);
  });

  it("rechaza con 403 cuando el rol no está permitido", async () => {
    simularSesion({ user: { ...USUARIO_BASE, rol: "asociados" } });

    const intento = requireRol(["consejo"]);

    await expect(intento).rejects.toBeInstanceOf(ErrorAutorizacion);
    await expect(requireRol(["consejo"])).rejects.toMatchObject({ status: 403 });
  });

  it("rechaza con 401 cuando no hay sesión", async () => {
    simularSesion({ user: null });

    await expect(requireRol(["admin"])).rejects.toMatchObject({ status: 401 });
  });

  it("rechaza con 401 cuando getSession lanza (falla cerrada)", async () => {
    getSessionMock.mockRejectedValue(new Error("BD caída"));

    await expect(requireRol(["admin"])).rejects.toMatchObject({ status: 401 });
  });

  it("permite admin solo si el correo está en ADMIN_ALLOWED_EMAILS", async () => {
    simularSesion({
      user: { ...USUARIO_BASE, email: "admin@comenor.org.mx", rol: "admin" },
    });

    const usuario = await requireRol(["admin"]);

    expect(usuario.rol).toBe("admin");
  });

  it("rechaza un user.rol admin cuyo correo NO está en la allowlist (falla cerrada)", async () => {
    simularSesion({
      user: { ...USUARIO_BASE, email: "intruso@ejemplo.mx", rol: "admin" },
    });

    await expect(requireRol(["admin"])).rejects.toMatchObject({ status: 403 });
  });

  it("rechaza con 403 cuando user.rol trae un valor inválido", async () => {
    simularSesion({ user: { ...USUARIO_BASE, rol: "superusuario" } });

    await expect(requireRol(["asociados"])).rejects.toMatchObject({ status: 403 });
  });

  it("rechaza con 403 cuando la sesión no trae rol", async () => {
    simularSesion({ user: { ...USUARIO_BASE } });

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
    simularSesion({ user: { ...USUARIO_BASE, name: "Persona", rol: "asociados" } });

    const user = await getSesion();

    expect(user?.email).toBe("persona@ejemplo.mx");
    expect(user?.user_metadata.name).toBe("Persona");
  });

  it("devuelve null sin sesión", async () => {
    simularSesion({ user: null });

    expect(await getSesion()).toBeNull();
  });

  it("devuelve null si el servicio de sesión lanza (falla cerrada)", async () => {
    getSessionMock.mockRejectedValue(new Error("timeout"));

    expect(await getSesion()).toBeNull();
  });
});

describe("getUsuarioConRol", () => {
  it("devuelve el rol leído de user.rol", async () => {
    simularSesion({ user: { ...USUARIO_BASE, rol: "asociados" } });

    const usuario = await getUsuarioConRol();

    expect(usuario).not.toBeNull();
    expect(usuario?.rol).toBe("asociados");
    expect(usuario?.id).toBe(USUARIO_BASE.id);
  });

  it("devuelve null si user.rol trae un valor inválido", async () => {
    simularSesion({ user: { ...USUARIO_BASE, rol: "superusuario" } });

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
