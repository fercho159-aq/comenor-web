/**
 * Cliente S3 apuntando a MinIO (VPS MAW Soluciones) — reemplaza Supabase Storage.
 *
 * ⚠️ SOLO SERVIDOR: usa `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`, llaves que
 * JAMÁS deben llegar al cliente. Importar este módulo desde un componente
 * cliente es un error de seguridad — el bundle expondría las credenciales del
 * almacenamiento completo. Úsalo únicamente en route handlers, server actions
 * y server components, detrás del middleware de roles.
 *
 * Topología: un ÚNICO bucket físico en MinIO (`S3_BUCKET`). Los "buckets"
 * lógicos heredados de Supabase (documentos | memorias | eventos) se conservan
 * como PREFIJOS de la clave del objeto: `{bucket}/{path}`. Así los consumidores
 * de `urlFirmada(bucket, path)` y compañía no cambian de firma.
 *
 * Variables de entorno (ver .env.example):
 *   S3_ENDPOINT          p. ej. https://minio.comenor.org.mx (o :9000 en dev)
 *   S3_REGION            MinIO ignora la región, pero el SDK la exige ("us-east-1")
 *   S3_ACCESS_KEY_ID     credencial de servicio (solo servidor)
 *   S3_SECRET_ACCESS_KEY credencial de servicio (solo servidor)
 *   S3_BUCKET            bucket físico único (privado)
 *   S3_PUBLIC_URL        (opcional) base pública para objetos servidos sin firma
 *                        — p. ej. detrás de Caddy con política de solo-lectura
 *                        para el prefijo `eventos/`. Fallback: S3_ENDPOINT/S3_BUCKET.
 */
import { S3Client } from "@aws-sdk/client-s3";

let clienteSingleton: S3Client | null = null;

/** Lee una variable de entorno obligatoria o truena con mensaje claro. */
function envObligatoria(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta ${nombre} en el entorno (ver .env.example).`);
  }
  return valor;
}

/** Nombre del bucket físico único en MinIO. */
export function bucketS3(): string {
  return envObligatoria("S3_BUCKET");
}

/**
 * Cliente S3 (singleton perezoso) configurado para MinIO.
 * `forcePathStyle: true` es obligatorio: MinIO no usa subdominios por bucket.
 */
export function clienteS3(): S3Client {
  if (clienteSingleton) return clienteSingleton;
  clienteSingleton = new S3Client({
    endpoint: envObligatoria("S3_ENDPOINT"),
    region: envObligatoria("S3_REGION"),
    credentials: {
      accessKeyId: envObligatoria("S3_ACCESS_KEY_ID"),
      secretAccessKey: envObligatoria("S3_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
  });
  return clienteSingleton;
}

/**
 * Mapea el bucket lógico heredado (documentos | memorias | eventos) + ruta del
 * objeto a la clave real dentro del bucket físico único: `{bucket}/{path}`.
 */
export function claveObjeto(bucket: string, path: string): string {
  if (!bucket || !path) {
    throw new Error("claveObjeto requiere bucket y path no vacíos.");
  }
  const bucketLimpio = bucket.replace(/^\/+|\/+$/g, "");
  const pathLimpio = path.replace(/^\/+/, "");
  return `${bucketLimpio}/${pathLimpio}`;
}
