/**
 * URL pública donde se SIRVE el sitio (para la imagen OG, enlaces absolutos,
 * sitemap y robots). Debe ser el dominio real del despliegue:
 * comenor-web.vercel.app hoy; comenor.org.mx cuando el DNS apunte a Vercel.
 * Se define en Vercel como NEXT_PUBLIC_SITE_URL.
 */
export const SITIO_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://comenor-web.vercel.app";
