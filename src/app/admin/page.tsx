/**
 * /admin — panel de inicio. Tablero con accesos a cada módulo del panel y un
 * resumen de conteos. Server Component protegido por `requireRol(["admin"])`
 * (además del middleware admin). Los conteos se leen en vivo (force-dynamic).
 */
import Link from "next/link";

import { LayoutAdmin } from "@/components/admin";
import { db } from "@/db";
import {
  documents,
  emailRecipients,
  events,
  galleries,
  registrations,
} from "@/db/schema";
import { count } from "drizzle-orm";
import { requireRol } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

type Conteos = {
  documentos: number;
  eventos: number;
  registros: number;
  galerias: number;
  destinatarios: number;
};

async function contarTodo(): Promise<Conteos> {
  const cero: Conteos = {
    documentos: 0,
    eventos: 0,
    registros: 0,
    galerias: 0,
    destinatarios: 0,
  };
  try {
    const [doc, ev, reg, gal, dest] = await Promise.all([
      db.select({ n: count() }).from(documents),
      db.select({ n: count() }).from(events),
      db.select({ n: count() }).from(registrations),
      db.select({ n: count() }).from(galleries),
      db.select({ n: count() }).from(emailRecipients),
    ]);
    return {
      documentos: doc[0]?.n ?? 0,
      eventos: ev[0]?.n ?? 0,
      registros: reg[0]?.n ?? 0,
      galerias: gal[0]?.n ?? 0,
      destinatarios: dest[0]?.n ?? 0,
    };
  } catch {
    // Si la BD no está disponible, el tablero sigue siendo navegable.
    return cero;
  }
}

type Acceso = {
  href: string;
  titulo: string;
  descripcion: string;
  conteo?: number;
  etiquetaConteo?: string;
};

export default async function AdminInicioPage() {
  const { user } = await requireRol(["admin"], { redirigirA: "/login" });
  const usuario = {
    nombre: user.email ?? "Administrador",
    correo: user.email ?? "",
    rol: "admin" as const,
  };

  const c = await contarTodo();

  const accesos: Acceso[] = [
    {
      href: "/admin/documentos",
      titulo: "Documentos",
      descripcion: "Actas, normas y memorias con niveles de acceso y versiones.",
      conteo: c.documentos,
      etiquetaConteo: "documentos",
    },
    {
      href: "/admin/eventos",
      titulo: "Eventos",
      descripcion: "Alta y edición del calendario público de eventos.",
      conteo: c.eventos,
      etiquetaConteo: "eventos",
    },
    {
      href: "/admin/registros",
      titulo: "Registros",
      descripcion: "Inscripciones a eventos y exportación a Excel.",
      conteo: c.registros,
      etiquetaConteo: "registros",
    },
    {
      href: "/admin/check-in",
      titulo: "Check-in",
      descripcion: "Validación de asistentes por código QR en el acceso.",
    },
    {
      href: "/admin/memorias",
      titulo: "Memorias",
      descripcion: "Galerías fotográficas: carga, portada y orden.",
      conteo: c.galerias,
      etiquetaConteo: "galerías",
    },
    {
      href: "/admin/aniversario",
      titulo: "Aniversario",
      descripcion: "Contenido conmemorativo del aniversario de COMENOR.",
    },
    {
      href: "/admin/notificaciones",
      titulo: "Destinatarios",
      descripcion: "Lista de correos que reciben avisos de nuevos documentos.",
      conteo: c.destinatarios,
      etiquetaConteo: "destinatarios",
    },
  ];

  return (
    <LayoutAdmin titulo="Panel de administración" usuario={usuario}>
      <div className="flex flex-col gap-6">
        <p className="max-w-2xl text-cuerpo text-tinta-suave">
          Bienvenido al panel de COMENOR. Elige un módulo para gestionar su
          contenido.
        </p>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accesos.map((a, i) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className={cardClase(i)}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-bold">{a.titulo}</span>
                  {typeof a.conteo === "number" ? (
                    <span className="rounded-full bg-blanco/15 px-3 py-1 text-sm font-bold">
                      {a.conteo}
                    </span>
                  ) : null}
                </span>
                <span className="text-sm text-blanco/80">{a.descripcion}</span>
                {typeof a.conteo === "number" && a.etiquetaConteo ? (
                  <span className="sr-only">
                    {a.conteo} {a.etiquetaConteo}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </LayoutAdmin>
  );
}

/** Alterna verde/verde-900 como las tarjetas sólidas de la marca. */
function cardClase(indice: number): string {
  const fondo = indice % 2 === 0 ? "bg-verde" : "bg-verde-900";
  return `tema-oscuro flex h-full flex-col gap-2 ${fondo} p-6 text-blanco transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5`;
}
