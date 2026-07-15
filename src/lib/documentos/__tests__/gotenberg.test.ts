/**
 * Tests del cliente Gotenberg con fetch mockeado: convertirAPdf postea el
 * multipart correcto (ruta LibreOffice, token Bearer) y devuelve los bytes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { convertirAPdf, esConvertible } from "../gotenberg";

const fetchMock = vi.fn();

describe("convertirAPdf (Gotenberg)", () => {
  beforeEach(() => {
    vi.stubEnv("GOTENBERG_URL", "https://docs.comenor.org.mx");
    vi.stubEnv("GOTENBERG_TOKEN", "token-prueba");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: async () => new Uint8Array([37, 80, 68, 70]).buffer, // "%PDF"
    } as unknown as Response);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("postea a /forms/libreoffice/convert con token y devuelve el PDF", async () => {
    const original = new Uint8Array([1, 2, 3, 4]);
    const pdf = await convertirAPdf(original, "acta-marzo.docx");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://docs.comenor.org.mx/forms/libreoffice/convert");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer token-prueba",
    });

    // El multipart lleva el archivo bajo "files" con su nombre y extensión
    // (Gotenberg elige el conversor por la extensión).
    const cuerpo = init.body as FormData;
    const parte = cuerpo.get("files");
    expect(parte).toBeInstanceOf(File);
    expect((parte as File).name).toBe("acta-marzo.docx");

    expect(pdf).toEqual(new Uint8Array([37, 80, 68, 70]));
  });

  it("truena con estatus no-200 de Gotenberg", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as Response);

    await expect(
      convertirAPdf(new Uint8Array([1]), "informe.xlsx"),
    ).rejects.toThrow(/Gotenberg respondió 503/);
  });

  it("rechaza extensiones no convertibles sin llamar a la red", async () => {
    await expect(
      convertirAPdf(new Uint8Array([1]), "foto.png"),
    ).rejects.toThrow(/Formato no convertible/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("truena claro si faltan GOTENBERG_URL / GOTENBERG_TOKEN", async () => {
    vi.stubEnv("GOTENBERG_TOKEN", "");
    await expect(
      convertirAPdf(new Uint8Array([1]), "acta.docx"),
    ).rejects.toThrow(/GOTENBERG_URL \/ GOTENBERG_TOKEN/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("esConvertible reconoce solo doc/docx/xls/xlsx", () => {
    expect(esConvertible("a.docx")).toBe(true);
    expect(esConvertible("a.XLS")).toBe(true);
    expect(esConvertible("a.pdf")).toBe(false);
    expect(esConvertible("sin-extension")).toBe(false);
  });
});
