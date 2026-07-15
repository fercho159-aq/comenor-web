/**
 * Resolución de la IP del cliente para rate limiting y auditoría.
 *
 * Seguridad (auditoría: spoofing de X-Forwarded-For):
 * El PRIMER valor de `X-Forwarded-For` lo escribe el cliente y es trivialmente
 * falsificable (`curl -H "X-Forwarded-For: 1.2.3.4"`), lo que anularía el rate
 * limit por IP. Los valores de confianza son los que AGREGA la plataforma:
 *
 * SUPOSICIÓN DE DESPLIEGUE (Vercel): el proxy de Vercel sobrescribe/agrega
 * `x-real-ip` con la IP real del socket y APPENDEA esa misma IP como ÚLTIMO
 * salto de `x-forwarded-for`. Por eso aquí se usa `x-real-ip` primero y, en su
 * defecto, el ÚLTIMO elemento de `x-forwarded-for` — nunca el primero.
 * Si el proyecto se moviera detrás de otro proxy (Cloudflare, nginx propio),
 * hay que revisar esta función contra los headers de esa plataforma.
 */

/** Valor devuelto cuando ningún header de confianza trae una IP. */
export const IP_DESCONOCIDA = "desconocida";

/**
 * Devuelve la IP de confianza del cliente a partir de los headers.
 *
 * Orden de resolución:
 *  1. `x-real-ip` (lo setea la plataforma; no lo puede fijar el cliente en Vercel).
 *  2. ÚLTIMO salto de `x-forwarded-for` (el que agregó el proxy de confianza).
 *  3. `"desconocida"` — todas las peticiones sin headers comparten cubeta de
 *     rate limit, que es el comportamiento seguro (falla cerrado).
 */
export function ipConfiable(headers: Headers): string {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const reenviado = headers.get("x-forwarded-for");
  if (reenviado) {
    const saltos = reenviado
      .split(",")
      .map((salto) => salto.trim())
      .filter((salto) => salto.length > 0);
    const ultimo = saltos[saltos.length - 1];
    if (ultimo) return ultimo;
  }

  return IP_DESCONOCIDA;
}
