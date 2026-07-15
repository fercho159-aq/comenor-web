import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Document, EmailRecipient } from "@/db/schema";

// --- Mocks de dependencias del route handler (sin servicios vivos) ---------

const {
  ErrorAutorizacionMock,
  requireRol,
  obtenerDocumento,
  obtenerDestinatariosActivos,
  enviarCorreo,
} = vi.hoisted(() => {
  /** Error de autorización con la misma forma que el real (status + instanceof). */
  class ErrorAutorizacionMock extends Error {
    constructor(
      public readonly status: 401 | 403,
      mensaje: string,
    ) {
      super(mensaje);
      this.name = "ErrorAutorizacion";
    }
  }
  return {
    ErrorAutorizacionMock,
    requireRol: vi.fn(),
    obtenerDocumento: vi.fn(),
    obtenerDestinatariosActivos: vi.fn(),
    enviarCorreo: vi.fn(),
  };
});

vi.mock("@/lib/auth/roles", () => ({
  requireRol,
  ErrorAutorizacion: ErrorAutorizacionMock,
}));
vi.mock("@/lib/notificaciones/consultas", () => ({
  obtenerDocumento,
  obtenerDestinatariosActivos,
}));
vi.mock("@/lib/email/resend", () => ({ enviarCorreo }));

import { POST } from "@/app/api/notificaciones/documento/route";

function peticion(body: unknown): Request {
  return new Request("http://localhost/api/notificaciones/documento", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function doc(nivelAcceso: Document["nivelAcceso"]): Document {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    titulo: "Acta de sesión ordinaria",
    mes: 7,
    anio: 2026,
    nivelAcceso,
    tipo: "Acta",
    storagePath: "docs/acta.pdf",
    formato: "pdf",
    creadoPor: "22222222-2222-4222-8222-222222222222",
    createdAt: new Date(),
  };
}

function destinatario(
  correo: string,
  perfil: EmailRecipient["perfil"],
  activo = true,
): EmailRecipient {
  return { id: `id-${correo}`, correo, perfil, activo };
}

describe("POST /api/notificaciones/documento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRol.mockResolvedValue({ user: { id: "admin" }, rol: "admin" });
    enviarCorreo.mockResolvedValue({ simulado: true });
  });

  it("notifica SOLO a los destinatarios del perfil que coincide con el nivel", async () => {
    obtenerDocumento.mockResolvedValue(doc("consejo"));
    obtenerDestinatariosActivos.mockResolvedValue([
      destinatario("consejo@comenor.mx", "consejo"),
      destinatario("asociado@comenor.mx", "asociados"),
      destinatario("admin@comenor.mx", "admin"),
    ]);

    const res = await POST(
      peticion({ documentId: "11111111-1111-4111-8111-111111111111" }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.enviados).toBe(1);
    // enviarCorreo recibió únicamente al perfil 'consejo'.
    expect(enviarCorreo).toHaveBeenCalledTimes(1);
    expect(enviarCorreo).toHaveBeenCalledWith(
      expect.objectContaining({ to: "consejo@comenor.mx" }),
    );
  });

  it("rechaza a quien no es admin con el status del ErrorAutorizacion (403)", async () => {
    requireRol.mockRejectedValue(
      new ErrorAutorizacionMock(403, "Sin permisos."),
    );

    const res = await POST(
      peticion({ documentId: "11111111-1111-4111-8111-111111111111" }),
    );

    expect(res.status).toBe(403);
    expect(obtenerDocumento).not.toHaveBeenCalled();
    expect(enviarCorreo).not.toHaveBeenCalled();
  });

  it("responde 400 con error por campo si falta documentId", async () => {
    const res = await POST(peticion({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.errores.documentId).toBeDefined();
    expect(enviarCorreo).not.toHaveBeenCalled();
  });

  it("responde 404 si el documento no existe", async () => {
    obtenerDocumento.mockResolvedValue(null);

    const res = await POST(
      peticion({ documentId: "11111111-1111-4111-8111-111111111111" }),
    );

    expect(res.status).toBe(404);
    expect(enviarCorreo).not.toHaveBeenCalled();
  });
});
