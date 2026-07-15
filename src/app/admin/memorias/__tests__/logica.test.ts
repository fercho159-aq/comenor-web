import { describe, expect, it } from "vitest";

import {
  construirRutaFoto,
  esImagenPermitida,
  moverEnLista,
  normalizarReordenamiento,
  siguienteOrden,
} from "../logica";
import { galeriaSchema } from "../schemas";

describe("esImagenPermitida", () => {
  it("acepta JPG, PNG y WebP", () => {
    expect(esImagenPermitida("image/jpeg")).toBe(true);
    expect(esImagenPermitida("image/png")).toBe(true);
    expect(esImagenPermitida("image/webp")).toBe(true);
  });

  it("rechaza otros tipos y valores vacíos", () => {
    expect(esImagenPermitida("image/gif")).toBe(false);
    expect(esImagenPermitida("application/pdf")).toBe(false);
    expect(esImagenPermitida(null)).toBe(false);
    expect(esImagenPermitida(undefined)).toBe(false);
  });
});

describe("construirRutaFoto", () => {
  it("compone {anio}/{galeriaId}/{id}.jpg", () => {
    expect(
      construirRutaFoto({ anio: 2026, galeriaId: "gal-1", id: "foto-9" }),
    ).toBe("2026/gal-1/foto-9.jpg");
  });

  it("rechaza un año fuera de rango", () => {
    expect(() =>
      construirRutaFoto({ anio: 1700, galeriaId: "g", id: "f" }),
    ).toThrow();
  });
});

describe("siguienteOrden", () => {
  it("arranca en 0 cuando la galería está vacía", () => {
    expect(siguienteOrden([])).toBe(0);
  });

  it("devuelve max + 1", () => {
    expect(siguienteOrden([0, 1, 2])).toBe(3);
    expect(siguienteOrden([5, 2, 9])).toBe(10);
  });
});

describe("normalizarReordenamiento", () => {
  it("asigna orden consecutivo desde 0", () => {
    expect(normalizarReordenamiento(["b", "a", "c"])).toEqual([
      { id: "b", orden: 0 },
      { id: "a", orden: 1 },
      { id: "c", orden: 2 },
    ]);
  });

  it("ignora duplicados conservando la primera aparición", () => {
    expect(normalizarReordenamiento(["a", "a", "b"])).toEqual([
      { id: "a", orden: 0 },
      { id: "b", orden: 1 },
    ]);
  });
});

describe("moverEnLista", () => {
  it("sube un elemento una posición", () => {
    expect(moverEnLista(["a", "b", "c"], "b", "arriba")).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("baja un elemento una posición", () => {
    expect(moverEnLista(["a", "b", "c"], "b", "abajo")).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("no mueve más allá de los extremos", () => {
    expect(moverEnLista(["a", "b", "c"], "a", "arriba")).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(moverEnLista(["a", "b", "c"], "c", "abajo")).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});

describe("galeriaSchema", () => {
  it("coacciona el año de string a número", () => {
    const r = galeriaSchema.safeParse({
      titulo: "Congreso 2026",
      anio: "2026",
      publicada: "true",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.anio).toBe(2026);
      expect(r.data.publicada).toBe(true);
    }
  });

  it("rechaza título corto y año inválido", () => {
    const r = galeriaSchema.safeParse({ titulo: "x", anio: "abc" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const campos = r.error.flatten().fieldErrors;
      expect(campos.titulo).toBeDefined();
      expect(campos.anio).toBeDefined();
    }
  });

  it("acepta eventoId nulo", () => {
    const r = galeriaSchema.safeParse({
      titulo: "Sesión ordinaria",
      anio: 2025,
      eventoId: null,
    });
    expect(r.success).toBe(true);
  });
});
