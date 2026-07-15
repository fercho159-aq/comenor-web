"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

type Enlace = { readonly href: string; readonly etiqueta: string };

/** Un item de la navegación es o un enlace suelto o un grupo desplegable. */
type ItemNav =
  | ({ readonly tipo: "enlace" } & Enlace)
  | {
      readonly tipo: "grupo";
      readonly etiqueta: string;
      readonly enlaces: readonly Enlace[];
    };

/*
 * Ocho destinos reales del sitio. A 1440 no caben cómodos en una sola fila
 * (el contenedor reserva 80px a la derecha para la barra lateral vertical),
 * así que Normatividad / Ejes temáticos / Código de ética viven bajo un
 * desplegable accesible. Ninguna página queda fuera de la navegación.
 */
const ITEMS: readonly ItemNav[] = [
  { tipo: "enlace", href: "/", etiqueta: "Inicio" },
  { tipo: "enlace", href: "/nosotros", etiqueta: "Nosotros" },
  { tipo: "enlace", href: "/consejo-directivo", etiqueta: "Consejo Directivo" },
  { tipo: "enlace", href: "/asociados", etiqueta: "Asociados" },
  { tipo: "enlace", href: "/eventos", etiqueta: "Eventos" },
  {
    tipo: "grupo",
    etiqueta: "Nuestro trabajo",
    enlaces: [
      { href: "/normatividad", etiqueta: "Normatividad" },
      { href: "/ejes", etiqueta: "Ejes temáticos" },
      { href: "/codigo-etica", etiqueta: "Código de ética" },
    ],
  },
  { tipo: "enlace", href: "/contacto", etiqueta: "Contacto" },
] as const;

/** Lista plana, en orden de lectura: la usa el panel móvil. */
const ENLACES_PLANOS: readonly Enlace[] = ITEMS.flatMap((item) =>
  item.tipo === "enlace"
    ? [{ href: item.href, etiqueta: item.etiqueta }]
    : item.enlaces,
);

function esRutaActiva(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const SELECTOR_ENFOCABLES =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Encabezado() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const botonRef = useRef<HTMLButtonElement | null>(null);
  // Solo puede haber un grupo abierto a la vez: la referencia apunta siempre al suyo.
  const grupoRef = useRef<HTMLLIElement | null>(null);
  const idBase = useId();

  const cerrar = useCallback(() => {
    setAbierto(false);
    botonRef.current?.focus();
  }, []);

  // El menú móvil y el desplegable se cierran al navegar (también con
  // atrás/adelante del navegador). Ajuste de estado durante el render, el patrón
  // recomendado por React frente a un useEffect que dispararía render en cascada.
  const [rutaDelMenu, setRutaDelMenu] = useState(pathname);
  if (rutaDelMenu !== pathname) {
    setRutaDelMenu(pathname);
    setAbierto(false);
    setGrupoAbierto(null);
  }

  // Escape cierra, Tab queda atrapado dentro del panel, y el fondo no hace scroll.
  useEffect(() => {
    if (!abierto) return;

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(SELECTOR_ENFOCABLES)?.focus();

    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        cerrar();
        return;
      }
      if (evento.key !== "Tab" || !panel) return;

      const enfocables = Array.from(
        panel.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES),
      );
      if (enfocables.length === 0) return;

      const primero = enfocables[0]!;
      const ultimo = enfocables[enfocables.length - 1]!;
      const activo = document.activeElement;

      if (evento.shiftKey && (activo === primero || !panel.contains(activo))) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && activo === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", alPulsar);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, cerrar]);

  // Un clic fuera cierra el desplegable de escritorio.
  useEffect(() => {
    if (grupoAbierto === null) return;

    const alApuntar = (evento: PointerEvent) => {
      const destino = evento.target;
      if (destino instanceof Node && !grupoRef.current?.contains(destino)) {
        setGrupoAbierto(null);
      }
    };

    document.addEventListener("pointerdown", alApuntar);
    return () => document.removeEventListener("pointerdown", alApuntar);
  }, [grupoAbierto]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-salvia/70 bg-humo/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[75rem] items-center justify-between gap-6 px-5 py-3 sm:px-8 lg:px-12 lg:pr-20">
        <Link
          href="/"
          className="shrink-0"
          aria-label="COMENOR — ir al inicio"
        >
          <Image
            src="/logo-comenor.svg"
            alt="COMENOR"
            width={152}
            height={60}
            priority
            unoptimized
            className="h-11 w-auto sm:h-12"
          />
        </Link>

        {/* Navegación de escritorio */}
        <nav aria-label="Navegación principal" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {ITEMS.map((item) => {
              if (item.tipo === "enlace") {
                const activa = esRutaActiva(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={activa ? "page" : undefined}
                      className={cn(
                        "relative block py-2 text-sm font-bold transition-colors",
                        activa
                          ? "text-verde"
                          : "text-tinta-suave hover:text-verde",
                      )}
                    >
                      {item.etiqueta}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-x-0 -bottom-px h-0.5 bg-vino transition-opacity",
                          activa ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </Link>
                  </li>
                );
              }

              // Grupo desplegable (patrón «disclosure»: botón + lista de enlaces).
              const expandido = grupoAbierto === item.etiqueta;
              const idPanel = `panel-${idBase}-${item.etiqueta}`;
              const algunaActiva = item.enlaces.some((enlace) =>
                esRutaActiva(pathname, enlace.href),
              );

              return (
                <li
                  key={item.etiqueta}
                  ref={expandido ? grupoRef : null}
                  className="relative"
                  onKeyDown={(evento) => {
                    if (evento.key !== "Escape" || !expandido) return;
                    evento.preventDefault();
                    setGrupoAbierto(null);
                    evento.currentTarget
                      .querySelector<HTMLButtonElement>("button")
                      ?.focus();
                  }}
                  onBlur={(evento) => {
                    // El foco salió del grupo entero (Tab desde el último enlace).
                    if (!evento.currentTarget.contains(evento.relatedTarget)) {
                      setGrupoAbierto(null);
                    }
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={expandido}
                    aria-controls={idPanel}
                    onClick={() =>
                      setGrupoAbierto(expandido ? null : item.etiqueta)
                    }
                    className={cn(
                      "relative flex items-center gap-1.5 py-2 text-sm font-bold transition-colors",
                      algunaActiva || expandido
                        ? "text-verde"
                        : "text-tinta-suave hover:text-verde",
                    )}
                  >
                    {item.etiqueta}
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={cn(
                        "size-3 transition-transform",
                        expandido && "rotate-180",
                      )}
                    >
                      <path d="M5 8.5 12 15.5 19 8.5" />
                    </svg>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-0 -bottom-px h-0.5 bg-vino transition-opacity",
                        algunaActiva ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </button>

                  <div
                    id={idPanel}
                    hidden={!expandido}
                    className="absolute top-full right-0 z-50 mt-2 min-w-60 border border-salvia bg-humo shadow-lg shadow-verde-900/10"
                  >
                    <ul className="flex flex-col py-1">
                      {item.enlaces.map((enlace) => {
                        const activa = esRutaActiva(pathname, enlace.href);
                        return (
                          <li key={enlace.href}>
                            <Link
                              href={enlace.href}
                              aria-current={activa ? "page" : undefined}
                              onClick={() => setGrupoAbierto(null)}
                              className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors hover:bg-salvia/50",
                                activa
                                  ? "text-verde"
                                  : "text-tinta hover:text-verde",
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "h-4 w-1 shrink-0 bg-vino transition-opacity",
                                  activa ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {enlace.etiqueta}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Botón hamburguesa (móvil / tablet) */}
        <button
          ref={botonRef}
          type="button"
          onClick={() => setAbierto((previo) => !previo)}
          aria-expanded={abierto}
          aria-controls="menu-movil"
          className="inline-flex size-11 items-center justify-center text-verde lg:hidden"
        >
          <span className="sr-only">
            {abierto ? "Cerrar menú" : "Abrir menú"}
          </span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            className="size-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            {abierto ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Panel móvil: lista plana, sin desplegables (aquí sí caben los 8 destinos) */}
      {abierto ? (
        <div
          ref={panelRef}
          id="menu-movil"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-salvia bg-humo lg:hidden"
        >
          <nav aria-label="Navegación principal (móvil)">
            <ul className="flex flex-col px-5 py-4 sm:px-8">
              {ENLACES_PLANOS.map((enlace) => {
                const activa = esRutaActiva(pathname, enlace.href);
                return (
                  <li key={enlace.href} className="border-b border-salvia">
                    <Link
                      href={enlace.href}
                      aria-current={activa ? "page" : undefined}
                      onClick={() => setAbierto(false)}
                      className={cn(
                        "flex items-center justify-between py-4 text-lg font-bold",
                        activa ? "text-verde" : "text-tinta",
                      )}
                    >
                      {enlace.etiqueta}
                      {activa ? (
                        <span
                          aria-hidden="true"
                          className="h-4 w-1 shrink-0 bg-vino"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
