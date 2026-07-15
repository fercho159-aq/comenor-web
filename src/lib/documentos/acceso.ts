/**
 * Reglas PURAS de acceso documental (sin Next, sin Supabase, sin I/O).
 *
 * Un documento tiene un `nivel_acceso` (enum nivel_acceso de la BD) y cada rol
 * ve un subconjunto jerárquico de niveles. Se prueba de forma aislada con
 * vitest y se reutiliza tanto en el filtrado del listado (GET) como en la
 * autorización de la URL firmada (defensa contra IDOR).
 *
 * Jerarquía (de menor a mayor sensibilidad):
 *   publico (0) < asociados (1) < consejo (2)
 *
 * Un rol accede a un nivel si el rango del nivel es <= al rango máximo del rol:
 *   - asociados → publico, asociados
 *   - consejo   → publico, asociados, consejo (ve todo su nivel y los menores)
 *   - admin     → todo (gestión)
 */
import type { Rol } from "@/lib/auth/permisos";

/** Nivel de acceso de un documento — espeja el enum nivel_acceso de Postgres. */
export type NivelAcceso = "publico" | "asociados" | "consejo";

/** Lista canónica de niveles, de menor a mayor sensibilidad. */
export const NIVELES_ACCESO: readonly NivelAcceso[] = [
  "publico",
  "asociados",
  "consejo",
] as const;

/** Type guard: ¿el valor crudo es un nivel de acceso válido? */
export function esNivelAcceso(valor: unknown): valor is NivelAcceso {
  return (
    typeof valor === "string" &&
    (NIVELES_ACCESO as readonly string[]).includes(valor)
  );
}

/** Rango de sensibilidad de un nivel (índice en la jerarquía). */
function rangoNivel(nivel: NivelAcceso): number {
  return NIVELES_ACCESO.indexOf(nivel);
}

/** Rango máximo que alcanza un rol. */
function rangoMaximoRol(rol: Rol): number {
  switch (rol) {
    case "asociados":
      return rangoNivel("asociados");
    case "consejo":
    case "admin":
      return rangoNivel("consejo");
  }
}

/**
 * Niveles de documento visibles para un rol, usado para filtrar el listado.
 * Devuelve una copia nueva (no mutable por el llamador).
 */
export function nivelesVisiblesPara(rol: Rol): NivelAcceso[] {
  const maximo = rangoMaximoRol(rol);
  return NIVELES_ACCESO.filter((nivel) => rangoNivel(nivel) <= maximo);
}

/**
 * ¿El rol puede acceder a un documento de este nivel?
 * Barrera contra IDOR: se llama ANTES de firmar cualquier URL de Storage.
 */
export function puedeAccederNivel(rol: Rol, nivel: NivelAcceso): boolean {
  return rangoNivel(nivel) <= rangoMaximoRol(rol);
}
