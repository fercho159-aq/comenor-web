import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Imágenes públicas servidas por MinIO (VPS MAW) — prefijo `eventos/`.
    // El host corresponde a S3_PUBLIC_URL; se declara aquí para que next/image
    // lo acepte. Actualizar si cambia el dominio de storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "comenor-storage.appsoluciones.duckdns.org",
        pathname: "/comenor/**",
      },
    ],
  },
};

export default nextConfig;
