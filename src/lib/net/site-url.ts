/**
 * URL canónica del sitio — fuente ÚNICA para construir enlaces absolutos
 * (correos, notification_url de Mercado Pago, back_urls, etc.).
 *
 * Seguridad (auditoría: host-header injection):
 * NUNCA se debe construir una URL absoluta a partir de los headers entrantes
 * `Host`, `Origin` o `X-Forwarded-Host`: los controla el cliente y permitirían
 * envenenar los enlaces del correo o desviar el webhook de pagos hacia un
 * dominio atacante. Esta función lee EXCLUSIVAMENTE la variable de entorno
 * `NEXT_PUBLIC_SITE_URL` (definida en .env.example y en Vercel).
 */

/** Fallback de desarrollo local. */
const URL_DESARROLLO = "http://localhost:3000";

/**
 * Devuelve la URL base canónica del sitio, sin diagonal final.
 *
 * - Con `NEXT_PUBLIC_SITE_URL` definida: esa URL (normalizada, sin `/` final).
 * - Sin ella: `http://localhost:3000` (solo aceptable en desarrollo; en
 *   producción se registra una advertencia porque los enlaces saldrían rotos).
 */
export function siteUrl(): string {
  const configurada = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configurada) {
    return configurada.replace(/\/+$/, "");
  }
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[site-url] NEXT_PUBLIC_SITE_URL no está definida en producción; " +
        "se usará el fallback de desarrollo y los enlaces absolutos saldrán rotos.",
    );
  }
  return URL_DESARROLLO;
}
