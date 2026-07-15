import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import BarraLateralVertical from "@/components/layout/BarraLateralVertical";
import Encabezado from "@/components/layout/Encabezado";
import PieDePagina from "@/components/layout/PieDePagina";
import SwooshFondo from "@/components/marca/SwooshFondo";
import { SITIO_URL } from "@/lib/site";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const TITULO_LARGO =
  "COMENOR — Consejo Mexicano de Normalización y Evaluación de la Conformidad";
const DESCRIPCION =
  "La confianza técnica que estandariza y evalúa lo Hecho en México. COMENOR impulsa una Infraestructura de la Calidad más eficiente, incluyente, accesible y competitiva: normalización, certificación, inspección y ensayo.";

export const metadata: Metadata = {
  metadataBase: new URL(SITIO_URL),
  title: {
    default: TITULO_LARGO,
    template: "%s | COMENOR",
  },
  description: DESCRIPCION,
  applicationName: "COMENOR",
  authors: [{ name: "COMENOR" }],
  creator: "COMENOR",
  publisher: "COMENOR",
  category: "Infraestructura de la Calidad",
  keywords: [
    "COMENOR",
    "Consejo Mexicano de Normalización",
    "evaluación de la conformidad",
    "Infraestructura de la Calidad",
    "normalización",
    "certificación",
    "unidades de inspección",
    "laboratorios de ensayo",
    "NOM",
    "NMX",
    "normas ASTM",
    "Hecho en México",
    "acreditación",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "COMENOR",
    title: TITULO_LARGO,
    description:
      "La confianza técnica que estandariza y evalúa lo Hecho en México.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO_LARGO,
    description:
      "La confianza técnica que estandariza y evalúa lo Hecho en México.",
    site: "@Comenormx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className={`${montserrat.variable} h-full antialiased`}>
      <body className="relative min-h-full flex flex-col font-sans">
        {/* JSON-LD de la organización (schema.org) para resultados enriquecidos. */}
        <script
          type="application/ld+json"
          // El contenido es estático y de confianza (sin datos de usuario).
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NGO",
              name: "Consejo Mexicano de Normalización y Evaluación de la Conformidad",
              alternateName: "COMENOR",
              url: SITIO_URL,
              logo: `${SITIO_URL}/icon.png`,
              image: `${SITIO_URL}/opengraph-image.png`,
              description: DESCRIPCION,
              email: "direccioncomenor@comenor.org.mx",
              telephone: "+52-55-2745-3035",
              foundingDate: "1996",
              areaServed: "MX",
              slogan: "La confianza técnica que estandariza y evalúa lo Hecho en México.",
              sameAs: [
                "https://www.linkedin.com/company/comenor",
                "https://www.instagram.com/comenormx",
                "https://x.com/Comenormx",
              ],
            }),
          }}
        />
        {/*
          Swoosh salvia anclado arriba a la derecha, detrás de todo el contenido.
          Va en su propia capa (no envuelve al encabezado) para no crear un
          contenedor con overflow-hidden que rompería el `sticky` del header.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[844px] overflow-hidden"
        >
          <SwooshFondo />
        </div>

        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-verde focus:px-4 focus:py-2 focus:font-bold focus:text-blanco"
        >
          Saltar al contenido
        </a>

        <Encabezado />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <PieDePagina />
        <BarraLateralVertical />
      </body>
    </html>
  );
}
