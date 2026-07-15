import type { Metadata } from "next";

import { Contenedor, Eyebrow, Titulo } from "@/components/ui";

import { listarEventosPublicadosFuturos } from "./_datos";
import TarjetaEvento from "./TarjetaEvento";

export const metadata: Metadata = {
  title: "Calendario de eventos",
  description:
    "Consulta los foros, cursos y sesiones de COMENOR. Regístrate en línea: eventos gratuitos y de pago con confirmación por correo y código QR de acceso.",
};

// El calendario se alimenta de la base de datos en cada visita (cupo en vivo).
export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const eventos = await listarEventosPublicadosFuturos();

  return (
    <Contenedor as="section" ancho="ancho" className="py-16 lg:py-24">
      <div className="max-w-2xl">
        <Eyebrow>Agenda COMENOR</Eyebrow>
        <Titulo as="h1" className="mt-3">
          Calendario de eventos
        </Titulo>
        <p className="text-cuerpo mt-4 text-tinta text-pretty">
          Foros, cursos y sesiones de trabajo. Regístrate en línea; recibirás la
          confirmación y tu código QR de acceso por correo.
        </p>
      </div>

      {eventos.length === 0 ? (
        <p className="text-cuerpo mt-12 text-tinta-suave">
          Por ahora no hay eventos programados. Vuelve pronto: publicamos nuevas
          fechas con regularidad.
        </p>
      ) : (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {eventos.map((evento) => (
            <li key={evento.id} className="flex">
              <TarjetaEvento evento={evento} />
            </li>
          ))}
        </ul>
      )}
    </Contenedor>
  );
}
