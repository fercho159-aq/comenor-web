import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Contenedor from "@/components/ui/Contenedor";
import Eyebrow from "@/components/ui/Eyebrow";

const ANIO_ACTUAL = new Date().getFullYear();

type Red = { nombre: string; usuario: string; href: string; icono: ReactNode };

/* Iconos monocromos, 24×24, `currentColor`. */
const REDES: readonly Red[] = [
  {
    nombre: "LinkedIn",
    usuario: "/company/comenor",
    href: "https://www.linkedin.com/company/comenor",
    icono: (
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    ),
  },
  {
    nombre: "Instagram",
    usuario: "@comenormx",
    href: "https://www.instagram.com/comenormx",
    icono: (
      <path d="M12 2.16c3.2 0 3.58.02 4.85.07 1.17.06 1.8.25 2.23.42.56.21.96.47 1.38.89.42.42.68.82.9 1.38.16.43.35 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.59-.07 4.85c-.06 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.35-2.23.41-1.27.06-1.65.07-4.85.07s-3.59-.01-4.86-.07c-1.17-.06-1.81-.25-2.23-.42a3.8 3.8 0 0 1-1.38-.9c-.42-.42-.69-.82-.9-1.38-.17-.42-.36-1.06-.42-2.23-.05-1.26-.06-1.65-.06-4.84s.01-3.59.06-4.86c.06-1.17.25-1.81.42-2.23.21-.57.48-.96.9-1.38.42-.42.81-.69 1.38-.9.42-.17 1.05-.36 2.22-.42 1.27-.05 1.65-.06 4.86-.06zM12 0C8.74 0 8.33.02 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.02 8.33 0 8.74 0 12s.02 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.77.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.02 4.95-.07c1.28-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38a5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.02-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.02 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
    ),
  },
  {
    nombre: "X",
    usuario: "@Comenormx",
    href: "https://x.com/Comenormx",
    icono: (
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.4z" />
    ),
  },
  // La slide 14 no da usuario de Facebook ni de YouTube: en ambos casos el
  // cliente puso https://comenor.org.mx/. Se respeta el dato tal cual hasta
  // que COMENOR entregue los perfiles definitivos (no se inventan cuentas).
  {
    nombre: "Facebook",
    usuario: "comenor.org.mx",
    href: "https://comenor.org.mx/",
    icono: (
      <path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.42c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.88v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07z" />
    ),
  },
  {
    nombre: "YouTube",
    usuario: "comenor.org.mx",
    href: "https://comenor.org.mx/",
    icono: (
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    ),
  },
] as const;

/*
 * Mapa completo del sitio: el pie enlaza las siete páginas internas, incluidas
 * las que en escritorio viven dentro del desplegable «Nuestro trabajo».
 *
 * TODO: reactivar el enlace a /eventos cuando exista la página
 * (módulo de calendario, fase 2). Hasta entonces no se enlaza: enviaba a un 404.
 */
const ENLACES_SITIO: readonly { href: string; etiqueta: string }[] = [
  { href: "/nosotros", etiqueta: "Nosotros" },
  { href: "/consejo-directivo", etiqueta: "Consejo Directivo" },
  { href: "/asociados", etiqueta: "Asociados y miembros" },
  { href: "/normatividad", etiqueta: "Normatividad" },
  { href: "/ejes", etiqueta: "Ejes temáticos" },
  { href: "/codigo-etica", etiqueta: "Código de ética" },
  { href: "/contacto", etiqueta: "Contacto" },
] as const;

/**
 * Pie de página. Reproduce el bloque de redes de la slide 14 (fondo verde,
 * logo blanco) y termina, como las 15 slides, con la franja vino de 8px
 * a todo el ancho.
 */
export default function PieDePagina() {
  return (
    <footer className="tema-oscuro mt-24 bg-verde text-blanco">
      <Contenedor className="py-14">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Marca */}
          <div>
            <Image
              src="/logo-comenor-blanco.svg"
              alt="COMENOR"
              width={190}
              height={75}
              unoptimized
              className="h-14 w-auto"
            />
            <p className="text-cuerpo mt-5 max-w-xs text-salvia text-pretty">
              Consejo Mexicano de Normalización y Evaluación de la Conformidad,
              A.C. La confianza técnica que estandariza y evalúa lo Hecho en
              México.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <Eyebrow variante="sobre-oscuro">Contacto</Eyebrow>
            <ul className="mt-4 space-y-3 text-cuerpo">
              <li>
                <a
                  href="https://comenor.org.mx"
                  className="underline-offset-4 hover:underline"
                >
                  comenor.org.mx
                </a>
              </li>
              <li>
                <a
                  href="mailto:direccioncomenor@comenor.org.mx"
                  className="underline-offset-4 hover:underline"
                >
                  direccioncomenor@comenor.org.mx
                </a>
              </li>
              <li>
                <a
                  href="tel:+525527453035"
                  className="underline-offset-4 hover:underline"
                >
                  55 2745 3035
                </a>
                <span className="block text-sm text-salvia">
                  Teléfono y WhatsApp
                </span>
              </li>
            </ul>
          </div>

          {/* Sitio */}
          <div>
            <Eyebrow variante="sobre-oscuro">Sitio</Eyebrow>
            <nav aria-label="Navegación del pie de página">
              <ul className="mt-4 space-y-3 text-cuerpo">
                {ENLACES_SITIO.map((enlace) => (
                  <li key={enlace.href}>
                    <Link
                      href={enlace.href}
                      className="underline-offset-4 hover:underline"
                    >
                      {enlace.etiqueta}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Redes sociales (slide 14) */}
        <div className="mt-12 border-t border-salvia/30 pt-8">
          <Eyebrow variante="sobre-oscuro">Conecta con nosotros</Eyebrow>
          <ul className="mt-4 flex flex-wrap items-center gap-4">
            {REDES.map((red) => (
              <li key={red.nombre}>
                <a
                  href={red.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-full border border-salvia/40 py-2 pr-4 pl-2 transition-colors hover:bg-verde-900"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blanco text-verde">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      focusable="false"
                      className="size-5"
                    >
                      {red.icono}
                    </svg>
                  </span>
                  <span className="text-sm">
                    <span className="block font-bold">{red.nombre}</span>
                    <span className="block text-salvia">{red.usuario}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 text-sm text-salvia">
          © {ANIO_ACTUAL} Consejo Mexicano de Normalización y Evaluación de la
          Conformidad, A.C. Todos los derechos reservados.
        </p>
      </Contenedor>

      {/* Franja vino de 8px al 100% del ancho: cierre de las 15 slides. */}
      <div aria-hidden="true" className="h-2 w-full bg-vino" />
    </footer>
  );
}
