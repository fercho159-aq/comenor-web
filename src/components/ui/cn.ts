/**
 * Une clases condicionales. El proyecto no tiene clsx/tailwind-merge como
 * dependencia, y no hace falta: las variantes del kit son excluyentes entre sí,
 * así que basta con filtrar valores falsos y unir con espacios.
 */
export function cn(
  ...clases: Array<string | false | null | undefined>
): string {
  return clases.filter(Boolean).join(" ");
}
