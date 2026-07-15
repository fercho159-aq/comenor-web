"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/components/ui";

/** Perfil del usuario en sesión (coincide con el enum `tipo_perfil`). */
type RolUsuario = "consejo" | "asociados" | "admin";

type UsuarioPanel = {
  nombre: string;
  correo: string;
  rol: RolUsuario;
};

type LayoutAdminProps = {
  /** Título de la vista actual (se muestra en el encabezado del contenido). */
  titulo: string;
  /** Usuario en sesión; alimenta el guard visual del encabezado. */
  usuario: UsuarioPanel;
  /**
   * Contenido del botón "Cerrar sesión". Normalmente un `<form action=…>` con
   * la server action de logout (la provee el agente de auth); se pasa como slot
   * para no acoplar este kit a esa implementación.
   */
  slotCerrarSesion?: ReactNode;
  children: ReactNode;
};

type EnlaceNav = { href: string; etiqueta: string };

/** Navegación del panel (mapea a los módulos de A3 en PLAN.md §3). */
const NAV: ReadonlyArray<EnlaceNav> = [
  { href: "/admin", etiqueta: "Panel" },
  { href: "/admin/documentos", etiqueta: "Documentos" },
  { href: "/admin/eventos", etiqueta: "Eventos" },
  { href: "/admin/registros", etiqueta: "Registros" },
  { href: "/admin/check-in", etiqueta: "Check-in" },
  { href: "/admin/memorias", etiqueta: "Memorias" },
  { href: "/admin/aniversario", etiqueta: "Aniversario" },
  { href: "/admin/destinatarios", etiqueta: "Destinatarios" },
];

const ETIQUETA_ROL: Record<RolUsuario, string> = {
  consejo: "Consejo",
  asociados: "Asociados",
  admin: "Administrador",
};

/**
 * Estructura del panel admin: barra lateral de navegación + área de contenido,
 * consistente con los tokens de marca (verde/vino/humo, Montserrat).
 *
 * El "guard visual" del encabezado muestra quién está en sesión y su rol; NO es
 * el control de acceso real (ese vive en el middleware de roles, otro agente).
 * Sirve para que el operador confirme de un vistazo con qué cuenta trabaja.
 */
export default function LayoutAdmin({
  titulo,
  usuario,
  slotCerrarSesion,
  children,
}: LayoutAdminProps) {
  const pathname = usePathname();

  const esActivo = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen flex-col bg-humo lg:flex-row">
      {/* Barra lateral */}
      <aside className="tema-oscuro flex flex-col bg-verde text-blanco lg:w-64 lg:shrink-0">
        <div className="flex items-center gap-2 border-b border-blanco/15 px-6 py-5">
          <span className="text-lg font-bold tracking-[0.18em]">COMENOR</span>
          <span className="text-xs font-bold uppercase tracking-wide text-salvia">
            Admin
          </span>
        </div>
        <nav
          aria-label="Navegación del panel"
          className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible lg:py-4"
        >
          {NAV.map((enlace) => {
            const activo = esActivo(enlace.href);
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors lg:rounded-none lg:border-l-4 lg:px-4",
                  activo
                    ? "bg-blanco text-verde lg:bg-verde-900 lg:border-vino lg:text-blanco"
                    : "text-salvia hover:bg-verde-900 hover:text-blanco lg:border-transparent",
                )}
              >
                {enlace.etiqueta}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Encabezado con guard visual */}
        <header className="flex flex-col gap-3 border-b border-tinta-suave/20 bg-blanco px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-titulo font-bold text-verde">{titulo}</h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-tinta">{usuario.nombre}</p>
              <p className="text-xs text-tinta-suave">{usuario.correo}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-verde-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blanco">
              {ETIQUETA_ROL[usuario.rol]}
            </span>
            {slotCerrarSesion}
          </div>
        </header>

        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>

        <div aria-hidden="true" className="h-2 w-full bg-vino" />
      </div>
    </div>
  );
}
