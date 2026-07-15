import { describe, expect, it } from "vitest";

import {
  esNivelAcceso,
  nivelesVisiblesPara,
  puedeAccederNivel,
} from "@/lib/documentos/acceso";

describe("acceso documental — nivelesVisiblesPara", () => {
  it("asociados ve solo publico y asociados (no consejo)", () => {
    expect(nivelesVisiblesPara("asociados")).toEqual(["publico", "asociados"]);
  });

  it("consejo ve todos los niveles", () => {
    expect(nivelesVisiblesPara("consejo")).toEqual([
      "publico",
      "asociados",
      "consejo",
    ]);
  });

  it("admin ve todos los niveles", () => {
    expect(nivelesVisiblesPara("admin")).toEqual([
      "publico",
      "asociados",
      "consejo",
    ]);
  });

  it("devuelve un arreglo nuevo, no una referencia mutable compartida", () => {
    const a = nivelesVisiblesPara("consejo");
    a.push("publico");
    expect(nivelesVisiblesPara("consejo")).toHaveLength(3);
  });
});

describe("acceso documental — puedeAccederNivel (barrera IDOR)", () => {
  it("asociado NO accede a documento de nivel consejo", () => {
    expect(puedeAccederNivel("asociados", "consejo")).toBe(false);
  });

  it("asociado accede a publico y asociados", () => {
    expect(puedeAccederNivel("asociados", "publico")).toBe(true);
    expect(puedeAccederNivel("asociados", "asociados")).toBe(true);
  });

  it("consejo accede a cualquier nivel", () => {
    expect(puedeAccederNivel("consejo", "publico")).toBe(true);
    expect(puedeAccederNivel("consejo", "asociados")).toBe(true);
    expect(puedeAccederNivel("consejo", "consejo")).toBe(true);
  });

  it("admin accede a cualquier nivel", () => {
    expect(puedeAccederNivel("admin", "consejo")).toBe(true);
  });
});

describe("acceso documental — esNivelAcceso", () => {
  it("acepta niveles válidos y rechaza basura", () => {
    expect(esNivelAcceso("consejo")).toBe(true);
    expect(esNivelAcceso("privado")).toBe(false);
    expect(esNivelAcceso(null)).toBe(false);
    expect(esNivelAcceso(42)).toBe(false);
  });
});
