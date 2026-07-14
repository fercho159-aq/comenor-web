import { describe, expect, it } from "vitest";

/**
 * Test de humo: verifica que la tuberia de pruebas esta viva (Vitest + jsdom)
 * y que el entorno cumple dos reglas duras del proyecto:
 *  - el runtime tiene ICU completo para es-MX (fechas y monedas con Intl, PLAN.md §2.18);
 *  - hay DOM disponible para los tests de componentes de React.
 */

describe("entorno de pruebas", () => {
  it("expone un DOM (jsdom)", () => {
    document.body.innerHTML = '<main id="contenido">COMENOR</main>';

    expect(document.getElementById("contenido")?.textContent).toBe("COMENOR");
  });
});

describe("localizacion es-MX", () => {
  it("formatea montos en MXN", () => {
    const monto = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(1234.5);

    expect(monto).toBe("$1,234.50");
  });

  it("formatea fechas largas en espanol de Mexico", () => {
    const fecha = new Intl.DateTimeFormat("es-MX", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(new Date("2026-03-09T12:00:00Z"));

    expect(fecha).toBe("9 de marzo de 2026");
  });
});
