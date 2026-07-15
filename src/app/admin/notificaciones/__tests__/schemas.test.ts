import { describe, expect, it } from "vitest";

import { destinatarioSchema } from "../schemas";

describe("destinatarioSchema", () => {
  it("normaliza el correo a minúsculas y recorta espacios", () => {
    const r = destinatarioSchema.safeParse({
      correo: "  Persona@Organismo.MX ",
      perfil: "asociados",
      activo: "true",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.correo).toBe("persona@organismo.mx");
      expect(r.data.activo).toBe(true);
    }
  });

  it("aplica activo=true por defecto", () => {
    const r = destinatarioSchema.safeParse({
      correo: "a@b.com",
      perfil: "consejo",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.activo).toBe(true);
  });

  it("rechaza correo inválido con mensaje por campo", () => {
    const r = destinatarioSchema.safeParse({
      correo: "no-es-correo",
      perfil: "admin",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.correo).toBeDefined();
    }
  });

  it("rechaza un perfil fuera del enum", () => {
    const r = destinatarioSchema.safeParse({
      correo: "a@b.com",
      perfil: "otro",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.perfil).toBeDefined();
    }
  });
});
