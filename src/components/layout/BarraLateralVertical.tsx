"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

/**
 * Detalle firmante de la marca: `comenor.org.mx | direccioncomenor@comenor.org.mx`
 * rotado 90°, pegado al borde derecho. Aparece en 14 de las 15 slides.
 *
 * Es decorativo (los mismos datos están enlazados y son accesibles en el pie de
 * página), así que va `aria-hidden` y fuera del flujo de foco. Solo desktop.
 *
 * Al ser `fixed`, la barra pasa por encima de secciones claras (fondo `humo`) y
 * oscuras (pie verde, «Visión 2026», tarjetas sólidas). En `tinta-suave` quedaba
 * ilegible sobre verde. En vez de confiar en la clase `.tema-oscuro` —que no todos
 * los bloques oscuros llevan— se mide la luminancia real del fondo que hay debajo
 * de la barra y se elige el tono como en las slides 13–14: claro sobre oscuro.
 * Mientras la barra cruza una frontera (mitad clara / mitad oscura) se desvanece,
 * de modo que nunca hay texto ilegible: legibilidad por encima de fidelidad.
 */

type Tono = "claro" | "oscuro" | "mixto";

/** Umbral de luminancia relativa (WCAG) a partir del cual el fondo es «oscuro». */
const UMBRAL_OSCURO = 0.45;
const NUMEROS = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

type Rgba = readonly [number, number, number, number];

/** Acepta `rgb()`, `rgba()` y `color(srgb …)`, las formas que devuelve el navegador. */
function parsearColor(valor: string): Rgba | null {
  const partes = valor.match(NUMEROS)?.map(Number);
  if (!partes || partes.length < 3) return null;

  const escala01 = valor.startsWith("color(");
  const factor = escala01 ? 255 : 1;
  const [r, g, b] = partes;
  const alfa = partes.length > 3 ? partes[3]! : 1;

  return [r! * factor, g! * factor, b! * factor, alfa] as const;
}

function canalLineal(canal: number): number {
  const v = canal / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** Luminancia relativa WCAG 2.x, 0 (negro) a 1 (blanco). */
function luminancia([r, g, b]: Rgba): number {
  return (
    0.2126 * canalLineal(r) +
    0.7152 * canalLineal(g) +
    0.0722 * canalLineal(b)
  );
}

/** Primer fondo opaco bajo un punto de la pantalla. */
function tonoEnPunto(x: number, y: number, propio: HTMLElement): Tono {
  for (const elemento of document.elementsFromPoint(x, y)) {
    if (propio.contains(elemento)) continue;

    const color = parsearColor(getComputedStyle(elemento).backgroundColor);
    if (!color || color[3] < 0.5) continue; // transparente: sigue hacia atrás

    return luminancia(color) < UMBRAL_OSCURO ? "oscuro" : "claro";
  }
  return "claro"; // sin fondo opaco detrás: manda el `humo` del body
}

export default function BarraLateralVertical() {
  const pathname = usePathname();
  const textoRef = useRef<HTMLParagraphElement | null>(null);
  const [tono, setTono] = useState<Tono>("claro");

  useEffect(() => {
    let pendiente = 0;

    const medir = () => {
      pendiente = 0;
      const texto = textoRef.current;
      if (!texto) return;

      const caja = texto.getBoundingClientRect();
      if (caja.width === 0 || caja.height === 0) return; // oculta (móvil)

      const x = caja.left + caja.width / 2;
      const muestras: Tono[] = [
        tonoEnPunto(x, caja.top + 4, texto),
        tonoEnPunto(x, caja.top + caja.height / 2, texto),
        tonoEnPunto(x, caja.bottom - 4, texto),
      ];

      const primera = muestras[0]!;
      const uniforme = muestras.every((muestra) => muestra === primera);
      setTono(uniforme ? primera : "mixto");
    };

    const programar = () => {
      if (pendiente !== 0) return;
      pendiente = window.requestAnimationFrame(medir);
    };

    programar();
    window.addEventListener("scroll", programar, { passive: true });
    window.addEventListener("resize", programar);

    return () => {
      if (pendiente !== 0) window.cancelAnimationFrame(pendiente);
      window.removeEventListener("scroll", programar);
      window.removeEventListener("resize", programar);
    };
  }, [pathname]); // al cambiar de ruta, el fondo bajo la barra cambia

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-1/2 right-2 z-10 hidden -translate-y-1/2 select-none lg:block"
    >
      {/* vertical-rl + rotate-180 = lectura de abajo hacia arriba, como en las slides */}
      <p
        ref={textoRef}
        className={cn(
          "rotate-180 text-xs transition-[color,opacity] duration-300 [writing-mode:vertical-rl]",
          tono === "oscuro" && "text-salvia",
          tono === "claro" && "text-tinta-suave",
          // A caballo entre una sección clara y una oscura: se desvanece en lugar
          // de quedar medio ilegible.
          tono === "mixto" && "text-tinta-suave opacity-0",
        )}
      >
        comenor.org.mx&nbsp;&nbsp;|&nbsp;&nbsp;direccioncomenor@comenor.org.mx
      </p>
    </div>
  );
}
