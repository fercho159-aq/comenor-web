/**
 * Fondo curvo de marca: dos bandas salvia sobre humo, ancladas en la
 * esquina superior derecha, barriendo hacia abajo-izquierda.
 * Aparece en las 15 slides de la presentación institucional; los trazos
 * están calcados de design-source (misma geometría en todas las slides).
 *
 * Uso: colocarlo como primer hijo de una sección con `position: relative`
 * y `overflow-hidden`; el contenido va después (queda encima).
 */
export default function SwooshFondo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1500 844"
      preserveAspectRatio="xMaxYMin slice"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute inset-0 h-full w-full select-none ${className}`}
    >
      {/* Banda mayor: entra por el borde superior y sale por el derecho */}
      <path
        className="fill-salvia"
        d="M 695 30
           C 900 -30 1200 -50 1500 105
           L 1500 372
           C 1380 250 1290 175 1200 125
           C 1050 62 900 45 800 38
           C 755 35 715 32 695 30
           Z"
      />
      {/* Banda menor: destello delgado junto al borde derecho */}
      <path
        className="fill-salvia"
        d="M 1270 226
           C 1350 290 1430 360 1500 424
           L 1500 516
           C 1410 425 1325 310 1270 226
           Z"
      />
    </svg>
  );
}
