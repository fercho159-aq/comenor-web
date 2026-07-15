import { cn } from "@/components/ui";
import type { NivelAcceso } from "@/lib/documentos/acceso";
import { etiquetaNivel } from "./_formato";

/**
 * Indicador del nivel de acceso de un documento. El `Badge` del kit admin cubre
 * estados de publicación/pago, no los niveles documentales; este pill usa los
 * mismos tokens de marca para los tres niveles jerárquicos.
 */
const ESTILO: Record<NivelAcceso, string> = {
  publico: "bg-salvia text-verde-900",
  asociados: "bg-verde text-blanco",
  consejo: "bg-verde-900 text-blanco",
};

export default function PillNivel({ nivel }: { nivel: NivelAcceso }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
        ESTILO[nivel],
      )}
    >
      {etiquetaNivel(nivel)}
    </span>
  );
}
