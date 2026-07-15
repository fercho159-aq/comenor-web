// @vitest-environment node
// Los route handlers usan Request/FormData/File (undici). jsdom no implementa
// bien FormData con File (cuelga request.formData()); node es el entorno real.
import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Rol, UsuarioConRol } from "@/lib/auth/roles";

/**
 * Estado mutable compartido con el mock de `@/db`. Cada test lo configura para
 * simular las filas que devolvería la BD, sin ningún servicio vivo.
 */
const estadoDb = vi.hoisted(() => ({
  selectResult: [] as unknown[],
  insertResult: [] as unknown[],
}));

// --- Mock del cliente Drizzle (sin Postgres real) --------------------------
vi.mock("@/db", () => {
  const thenable = (obtener: () => unknown) => {
    const chain: Record<string, unknown> = {};
    for (const metodo of ["from", "where", "limit", "orderBy"]) {
      chain[metodo] = () => chain;
    }
    chain.then = (
      resolve: (v: unknown) => unknown,
      reject: (e: unknown) => unknown,
    ) => Promise.resolve(obtener()).then(resolve, reject);
    return chain;
  };
  const db = {
    select: () => thenable(() => estadoDb.selectResult),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve(estadoDb.insertResult),
      }),
    }),
  };
  return { db };
});

// --- Mock de auth/roles (mismo ErrorAutorizacion que usan los handlers) -----
vi.mock("@/lib/auth/roles", () => {
  class ErrorAutorizacion extends Error {
    constructor(
      public readonly status: 401 | 403,
      mensaje: string,
    ) {
      super(mensaje);
      this.name = "ErrorAutorizacion";
    }
  }
  return {
    ErrorAutorizacion,
    getUsuarioConRol: vi.fn(),
    requireRol: vi.fn(),
  };
});

// --- Mock de servicios externos --------------------------------------------
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));
vi.mock("@/lib/storage/firmadas", () => ({
  urlFirmada: vi.fn(),
  VIDA_URL_FIRMADA_SEGUNDOS: 60,
}));

import {
  ErrorAutorizacion,
  getUsuarioConRol,
  requireRol,
} from "@/lib/auth/roles";
import { urlFirmada } from "@/lib/storage/firmadas";
import { createAdminClient } from "@/lib/supabase/admin";
import { POST as crearDocumento } from "@/app/api/documentos/route";
import { GET as obtenerUrlFirmada } from "@/app/api/documentos/[id]/url-firmada/route";
import { POST as crearVersion } from "@/app/api/documentos/[id]/versiones/route";

const mockRequireRol = vi.mocked(requireRol);
const mockGetUsuario = vi.mocked(getUsuarioConRol);
const mockUrlFirmada = vi.mocked(urlFirmada);
const mockCrearAdmin = vi.mocked(createAdminClient);

/** Construye un UsuarioConRol de prueba (User mínimo, casteado). */
function usuarioDe(rol: Rol, id = "u", email = `${rol}@comenor.org.mx`): UsuarioConRol {
  return { user: { id, email } as unknown as User, rol };
}

const usuarioAdmin = usuarioDe("admin", "admin-uuid");

function formDataDoc(campos: Record<string, string>, conArchivo = true): FormData {
  const form = new FormData();
  for (const [k, v] of Object.entries(campos)) form.set(k, v);
  if (conArchivo) {
    form.set(
      "archivo",
      new File([new Uint8Array([1, 2, 3])], "acta.pdf", {
        type: "application/pdf",
      }),
    );
  }
  return form;
}

function peticionPost(body: FormData): Request {
  return new Request("http://localhost/api/documentos", {
    method: "POST",
    body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  estadoDb.selectResult = [];
  estadoDb.insertResult = [];
});

// ===========================================================================
// POST /api/documentos — validación doble Zod, 400 por campo
// ===========================================================================
describe("POST /api/documentos", () => {
  it("payload incompleto (falta titulo) → 400 con error por campo", async () => {
    mockRequireRol.mockResolvedValue(usuarioAdmin);
    const res = await crearDocumento(
      peticionPost(
        formDataDoc({
          mes: "7",
          anio: "2026",
          nivelAcceso: "consejo",
          tipo: "acta",
        }),
      ),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errores.titulo).toBeDefined();
    // Nunca llegó a subir a Storage.
    expect(mockCrearAdmin).not.toHaveBeenCalled();
  });

  it("sin archivo → 400 con error en 'archivo'", async () => {
    mockRequireRol.mockResolvedValue(usuarioAdmin);
    const res = await crearDocumento(
      peticionPost(
        formDataDoc(
          {
            titulo: "Acta de sesión ordinaria",
            mes: "7",
            anio: "2026",
            nivelAcceso: "consejo",
            tipo: "acta",
          },
          false,
        ),
      ),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errores.archivo).toBeDefined();
    expect(mockCrearAdmin).not.toHaveBeenCalled();
  });

  it("sin rol admin → 401/403 (ErrorAutorizacion propagado)", async () => {
    mockRequireRol.mockRejectedValue(
      new ErrorAutorizacion(403, "No autorizado"),
    );
    const res = await crearDocumento(
      peticionPost(formDataDoc({ titulo: "x" })),
    );
    expect(res.status).toBe(403);
  });
});

// ===========================================================================
// GET /api/documentos/[id]/url-firmada — barrera IDOR
// ===========================================================================
describe("GET /api/documentos/[id]/url-firmada", () => {
  const params = Promise.resolve({ id: "doc-consejo" });

  it("asociado pide documento de nivel consejo → 403 y NO se firma URL (IDOR)", async () => {
    mockGetUsuario.mockResolvedValue(usuarioDe("asociados", "socio"));
    estadoDb.selectResult = [
      { nivelAcceso: "consejo", storagePath: "2026/07/x.pdf" },
    ];
    const res = await obtenerUrlFirmada(new Request("http://x"), { params });
    expect(res.status).toBe(403);
    expect(mockUrlFirmada).not.toHaveBeenCalled();
  });

  it("consejo pide documento de nivel consejo → 200 con URL firmada", async () => {
    mockGetUsuario.mockResolvedValue(usuarioDe("consejo"));
    estadoDb.selectResult = [
      { nivelAcceso: "consejo", storagePath: "2026/07/x.pdf" },
    ];
    mockUrlFirmada.mockResolvedValue("https://signed.example/x");
    const res = await obtenerUrlFirmada(new Request("http://x"), { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe("https://signed.example/x");
    expect(mockUrlFirmada).toHaveBeenCalledWith(
      "documentos",
      "2026/07/x.pdf",
      60,
    );
  });

  it("sin sesión → 401", async () => {
    mockGetUsuario.mockResolvedValue(null);
    const res = await obtenerUrlFirmada(new Request("http://x"), { params });
    expect(res.status).toBe(401);
    expect(mockUrlFirmada).not.toHaveBeenCalled();
  });

  it("documento inexistente → 404", async () => {
    mockGetUsuario.mockResolvedValue(usuarioDe("consejo"));
    estadoDb.selectResult = [];
    const res = await obtenerUrlFirmada(new Request("http://x"), { params });
    expect(res.status).toBe(404);
    expect(mockUrlFirmada).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// POST /api/documentos/[id]/versiones — versión incremental + validación
// ===========================================================================
describe("POST /api/documentos/[id]/versiones", () => {
  const params = Promise.resolve({ id: "doc-1" });
  const usuarioConsejo = usuarioDe("consejo", "consejo-uuid");

  function peticionJson(cuerpo: unknown): Request {
    return new Request("http://x/api/documentos/doc-1/versiones", {
      method: "POST",
      body: JSON.stringify(cuerpo),
      headers: { "content-type": "application/json" },
    });
  }

  it("contenido vacío → 400 con error por campo", async () => {
    mockRequireRol.mockResolvedValue(usuarioConsejo);
    const res = await crearVersion(peticionJson({ contenidoRichtext: "" }), {
      params,
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errores.contenidoRichtext).toBeDefined();
  });

  it("asociado (sin rol consejo/admin) → 403", async () => {
    mockRequireRol.mockRejectedValue(new ErrorAutorizacion(403, "No"));
    const res = await crearVersion(
      peticionJson({ contenidoRichtext: "<p>hola</p>" }),
      { params },
    );
    expect(res.status).toBe(403);
  });

  it("crea versión incremental (max+1) y devuelve 201", async () => {
    mockRequireRol.mockResolvedValue(usuarioConsejo);
    // 1.ª consulta: nivel del documento; 2.ª: última versión.
    // El mock devuelve el mismo selectResult; basta que el handler no rompa.
    estadoDb.selectResult = [{ nivelAcceso: "consejo", version: 4 }];
    estadoDb.insertResult = [{ id: "ver-uuid", version: 5 }];
    const res = await crearVersion(
      peticionJson({ contenidoRichtext: "<p>Contenido nuevo</p>" }),
      { params },
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.version).toBe(5);
  });
});
