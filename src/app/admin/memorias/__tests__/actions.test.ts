// @vitest-environment node
// Las server actions usan crypto/Buffer/FormData; el entorno node es el real.
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Estado mutable compartido con el mock de `@/db`. Cada test configura las
 * filas que devolvería Postgres, sin ningún servicio vivo.
 *
 * - `selectQueue`: cola de resultados; cada `db.select()` consume el siguiente.
 * - `updateCount`: nº de `db.update()` ejecutados (para probar que el camino de
 *   rechazo NO escribe nada).
 */
const estadoDb = vi.hoisted(() => ({
  selectQueue: [] as unknown[][],
  updateCount: 0,
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
    select: () =>
      thenable(() =>
        estadoDb.selectQueue.length > 0 ? estadoDb.selectQueue.shift() : [],
      ),
    update: () => {
      estadoDb.updateCount += 1;
      return { set: () => ({ where: () => Promise.resolve(undefined) }) };
    },
    insert: () => ({ values: () => Promise.resolve(undefined) }),
  };
  return { db };
});

// --- Mock de auth/roles (mismo ErrorAutorizacion que usan las acciones) -----
vi.mock("@/lib/auth/roles", () => {
  class ErrorAutorizacion extends Error {
    constructor(mensaje: string) {
      super(mensaje);
      this.name = "ErrorAutorizacion";
    }
  }
  return { ErrorAutorizacion, requireRol: vi.fn() };
});

// --- Mock de servicios externos que la acción importa a nivel de módulo -----
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("sharp", () => ({ default: vi.fn() }));

import { requireRol } from "@/lib/auth/roles";

import { establecerPortada, reordenarFotos } from "../actions";

const mockRequireRol = vi.mocked(requireRol);

// UUIDs de prueba deterministas (reordenFotosSchema exige uuid).
const FOTO_A = "11111111-1111-4111-8111-111111111111"; // galería A (ajena)
const FOTO_B1 = "22222222-2222-4222-8222-222222222222"; // galería B
const FOTO_B2 = "33333333-3333-4333-8333-333333333333"; // galería B
const GALERIA_B = "44444444-4444-4444-8444-444444444444";

beforeEach(() => {
  vi.clearAllMocks();
  estadoDb.selectQueue = [];
  estadoDb.updateCount = 0;
  mockRequireRol.mockResolvedValue({
    user: { id: "admin-uuid" },
    rol: "admin",
  } as never);
});

describe("establecerPortada — IDOR de integridad", () => {
  it("rechaza fijar como portada de B una foto que es de la galería A", async () => {
    // La verificación WHERE (storagePath AND gallery_id = B) no encuentra la
    // foto de A: la BD devuelve vacío.
    estadoDb.selectQueue = [[]];

    const res = await establecerPortada(GALERIA_B, "2026/galeria-a/foto.jpg");

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.mensaje).toContain("no pertenece");
    }
    // Nunca debe escribir la portada.
    expect(estadoDb.updateCount).toBe(0);
  });

  it("acepta cuando la foto sí pertenece a la galería", async () => {
    estadoDb.selectQueue = [[{ id: FOTO_B1 }]];

    const res = await establecerPortada(GALERIA_B, "2026/galeria-b/foto.jpg");

    expect(res.ok).toBe(true);
    // Actualizó galleries.portada una vez.
    expect(estadoDb.updateCount).toBe(1);
  });
});

describe("reordenarFotos — IDOR de integridad", () => {
  it("rechaza el reorden si incluye una foto ajena a la galería", async () => {
    // Ids propios de la galería B (lo que devuelve el SELECT por gallery_id).
    estadoDb.selectQueue = [[{ id: FOTO_B1 }, { id: FOTO_B2 }]];

    // El atacante intercala una foto de la galería A.
    const res = await reordenarFotos(GALERIA_B, [FOTO_B1, FOTO_A, FOTO_B2]);

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.mensaje).toContain("no pertenece");
    }
    // Ningún UPDATE de orden debe ejecutarse si hay una foto intrusa.
    expect(estadoDb.updateCount).toBe(0);
  });

  it("acepta el reorden cuando todas las fotos son de la galería", async () => {
    estadoDb.selectQueue = [[{ id: FOTO_B1 }, { id: FOTO_B2 }]];

    const res = await reordenarFotos(GALERIA_B, [FOTO_B2, FOTO_B1]);

    expect(res.ok).toBe(true);
    // Un UPDATE por foto reordenada.
    expect(estadoDb.updateCount).toBe(2);
  });
});
