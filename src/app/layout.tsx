import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import BarraLateralVertical from "@/components/layout/BarraLateralVertical";
import Encabezado from "@/components/layout/Encabezado";
import PieDePagina from "@/components/layout/PieDePagina";
import SwooshFondo from "@/components/marca/SwooshFondo";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://comenor.org.mx"),
  title: {
    default:
      "COMENOR — Consejo Mexicano de Normalización y Evaluación de la Conformidad",
    template: "%s | COMENOR",
  },
  description:
    "La confianza técnica que estandariza y evalúa lo Hecho en México. COMENOR impulsa el fortalecimiento de una Infraestructura de la Calidad más eficiente, incluyente, accesible y competitiva para México.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "COMENOR",
    title:
      "COMENOR — Consejo Mexicano de Normalización y Evaluación de la Conformidad",
    description:
      "La confianza técnica que estandariza y evalúa lo Hecho en México.",
    url: "https://comenor.org.mx",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className={`${montserrat.variable} h-full antialiased`}>
      <body className="relative min-h-full flex flex-col font-sans">
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
