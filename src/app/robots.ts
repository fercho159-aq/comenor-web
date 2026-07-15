import type { MetadataRoute } from "next";

import { SITIO_URL } from "@/lib/site";

/**
 * robots.txt. Indexa el sitio público; bloquea el panel, la API, el login y el
 * micrositio privado. Apunta al sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/login", "/miembros"],
    },
    sitemap: `${SITIO_URL}/sitemap.xml`,
    host: SITIO_URL,
  };
}
