import type { ReactNode } from "react";
import { cn } from "@/components/ui";

/**
 * Tarjeta blanca del bloque "La casa de todos los actores" (slide 05):
 * rectángulo blanco sin radius, título Bold verde centrado + descripción.
 * Es local a /normatividad porque el UI kit solo cubre las tarjetas sólidas.
 */
export function TarjetaClara({
  titulo,
  descripcion,
  className,
}: {
  titulo: ReactNode;
  descripcion: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center gap-3 bg-blanco p-6 text-center sm:p-8",
        className,
      )}
    >
      <h3 className="text-lg font-bold text-verde sm:text-xl">{titulo}</h3>
      <p className="text-cuerpo text-tinta text-pretty">{descripcion}</p>
    </div>
  );
}

/*
 * El Código de Ética (slide 07) vive en /codigo-etica, con su propia
 * TarjetaPrincipio. Aquí ya no se duplica.
 */
