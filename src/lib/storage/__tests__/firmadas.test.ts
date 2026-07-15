/**
 * Tests de urlFirmada sobre MinIO/S3 con el presigner mockeado: la firma
 * pública (bucket, path, segundos=60) se conserva tras dejar Supabase.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSignedUrlMock, comandosGet } = vi.hoisted(() => ({
  getSignedUrlMock: vi.fn(),
  comandosGet: [] as Array<{ Bucket?: string; Key?: string }>,
}));

vi.mock("@aws-sdk/client-s3", () => {
  class S3Client {
    send = vi.fn();
  }
  class GetObjectCommand {
    constructor(readonly input: { Bucket?: string; Key?: string }) {
      comandosGet.push(input);
    }
  }
  return { S3Client, GetObjectCommand };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: getSignedUrlMock,
}));

import { urlFirmada, VIDA_URL_FIRMADA_SEGUNDOS } from "../firmadas";

describe("urlFirmada (MinIO)", () => {
  beforeEach(() => {
    vi.stubEnv("S3_ENDPOINT", "http://minio.local:9000");
    vi.stubEnv("S3_REGION", "us-east-1");
    vi.stubEnv("S3_ACCESS_KEY_ID", "clave-prueba");
    vi.stubEnv("S3_SECRET_ACCESS_KEY", "secreto-prueba");
    vi.stubEnv("S3_BUCKET", "comenor");
    getSignedUrlMock.mockResolvedValue(
      "http://minio.local:9000/comenor/documentos/2026/03/doc.pdf?X-Amz-Expires=60&X-Amz-Signature=abc",
    );
    comandosGet.length = 0;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    getSignedUrlMock.mockReset();
  });

  it("genera una presigned URL con expiración de 60 s por defecto", async () => {
    const url = await urlFirmada("documentos", "2026/03/doc.pdf");

    expect(url).toContain("X-Amz-Expires");
    expect(getSignedUrlMock).toHaveBeenCalledTimes(1);
    expect(getSignedUrlMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: VIDA_URL_FIRMADA_SEGUNDOS },
    );
    // El bucket lógico viaja como prefijo dentro del bucket físico único.
    expect(comandosGet[0]).toEqual({
      Bucket: "comenor",
      Key: "documentos/2026/03/doc.pdf",
    });
  });

  it("acepta una vida personalizada y la limita a 300 s máximo", async () => {
    await urlFirmada("memorias", "2026/g1/foto.jpg", 120);
    expect(getSignedUrlMock).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 120 },
    );

    await urlFirmada("memorias", "2026/g1/foto.jpg", 99999);
    expect(getSignedUrlMock).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 300 },
    );
  });

  it("rechaza bucket o path vacíos", async () => {
    await expect(urlFirmada("", "x.pdf")).rejects.toThrow(/no vacíos/);
    await expect(urlFirmada("documentos", "")).rejects.toThrow(/no vacíos/);
    expect(getSignedUrlMock).not.toHaveBeenCalled();
  });

  it("envuelve los errores del presigner con contexto", async () => {
    getSignedUrlMock.mockRejectedValueOnce(new Error("conexión rechazada"));
    await expect(urlFirmada("documentos", "a.pdf")).rejects.toThrow(
      /No se pudo firmar la URL de documentos\/a\.pdf: conexión rechazada/,
    );
  });
});
