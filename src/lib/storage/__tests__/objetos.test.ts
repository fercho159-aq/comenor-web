/**
 * Tests de subirObjeto / obtenerObjeto / eliminarObjetos / urlPublica con el
 * cliente S3 mockeado: cada helper debe emitir el comando S3 correcto.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface EntradaComando {
  tipo: "Put" | "Get" | "Delete";
  input: Record<string, unknown>;
}

const { enviarMock, comandos } = vi.hoisted(() => ({
  enviarMock: vi.fn(),
  comandos: [] as EntradaComando[],
}));

vi.mock("@aws-sdk/client-s3", () => {
  class S3Client {
    send = enviarMock;
  }
  class PutObjectCommand {
    constructor(readonly input: Record<string, unknown>) {
      comandos.push({ tipo: "Put", input });
    }
  }
  class GetObjectCommand {
    constructor(readonly input: Record<string, unknown>) {
      comandos.push({ tipo: "Get", input });
    }
  }
  class DeleteObjectsCommand {
    constructor(readonly input: Record<string, unknown>) {
      comandos.push({ tipo: "Delete", input });
    }
  }
  return { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand };
});

import {
  eliminarObjetos,
  obtenerObjeto,
  subirObjeto,
  urlPublica,
} from "../objetos";

describe("objetos S3 (MinIO)", () => {
  beforeEach(() => {
    vi.stubEnv("S3_ENDPOINT", "http://minio.local:9000");
    vi.stubEnv("S3_REGION", "us-east-1");
    vi.stubEnv("S3_ACCESS_KEY_ID", "clave-prueba");
    vi.stubEnv("S3_SECRET_ACCESS_KEY", "secreto-prueba");
    vi.stubEnv("S3_BUCKET", "comenor");
    enviarMock.mockResolvedValue({});
    comandos.length = 0;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    enviarMock.mockReset();
  });

  it("subirObjeto emite PutObjectCommand privado sin sobrescribir por defecto", async () => {
    const cuerpo = new Uint8Array([1, 2, 3]);
    await subirObjeto("documentos", "2026/03/a.pdf", cuerpo, {
      contentType: "application/pdf",
    });

    expect(enviarMock).toHaveBeenCalledTimes(1);
    expect(comandos[0].tipo).toBe("Put");
    expect(comandos[0].input).toMatchObject({
      Bucket: "comenor",
      Key: "documentos/2026/03/a.pdf",
      Body: cuerpo,
      ContentType: "application/pdf",
      IfNoneMatch: "*", // upsert:false — no pisar objetos existentes
    });
  });

  it("subirObjeto con sobrescribir:true omite If-None-Match", async () => {
    await subirObjeto("eventos", "portadas/e1.webp", new Uint8Array([9]), {
      contentType: "image/webp",
      sobrescribir: true,
    });
    expect(comandos[0].input).not.toHaveProperty("IfNoneMatch");
  });

  it("obtenerObjeto emite GetObjectCommand y devuelve los bytes", async () => {
    const bytes = new Uint8Array([7, 8, 9]);
    enviarMock.mockResolvedValueOnce({
      Body: { transformToByteArray: async () => bytes },
    });

    const resultado = await obtenerObjeto("documentos", "2026/03/a.pdf");

    expect(comandos[0]).toEqual({
      tipo: "Get",
      input: { Bucket: "comenor", Key: "documentos/2026/03/a.pdf" },
    });
    expect(resultado).toEqual(bytes);
  });

  it("eliminarObjetos emite DeleteObjectsCommand con todas las claves", async () => {
    await eliminarObjetos("memorias", ["2026/g1/f1.jpg", "2026/g1/f2.jpg"]);

    expect(comandos[0].tipo).toBe("Delete");
    expect(comandos[0].input).toMatchObject({
      Bucket: "comenor",
      Delete: {
        Objects: [
          { Key: "memorias/2026/g1/f1.jpg" },
          { Key: "memorias/2026/g1/f2.jpg" },
        ],
        Quiet: true,
      },
    });
  });

  it("eliminarObjetos sin rutas no llama a S3", async () => {
    await eliminarObjetos("memorias", []);
    expect(enviarMock).not.toHaveBeenCalled();
  });

  it("urlPublica usa S3_PUBLIC_URL si existe y si no S3_ENDPOINT/S3_BUCKET", () => {
    vi.stubEnv("S3_PUBLIC_URL", "https://archivos.comenor.org.mx");
    expect(urlPublica("eventos", "portadas/e1.webp")).toBe(
      "https://archivos.comenor.org.mx/eventos/portadas/e1.webp",
    );

    vi.stubEnv("S3_PUBLIC_URL", "");
    expect(urlPublica("eventos", "portadas/e1.webp")).toBe(
      "http://minio.local:9000/comenor/eventos/portadas/e1.webp",
    );
  });
});
