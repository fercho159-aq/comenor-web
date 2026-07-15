"use client";

/**
 * <RevelarGrupo> — Variante de <Revelar> para listas y grids.
 *
 * Aplica un stagger suave a los HIJOS DIRECTOS del contenedor cuando éste
 * entra en el viewport (start "top 85%"). Pensado para las tarjetas de logos
 * de asociados, el grid de ecosistema y las líneas de acción de los ejes.
 *
 * Mismo contrato que <Revelar>:
 * - SSR-safe: los hijos se renderizan visibles en el HTML del servidor; el
 *   estado inicial se aplica solo en cliente. Sin JS, todo queda visible.
 * - prefers-reduced-motion: reduce → sin animación, contenido visible.
 * - Sin CLS: solo transform/opacity.
 * - Cleanup con matchMedia().revert().
 *
 * Uso — grid de tarjetas:
 *   <RevelarGrupo className="grid grid-cols-2 gap-6 md:grid-cols-4">
 *     {asociados.map((a) => (
 *       <article key={a.id}>…</article>
 *     ))}
 *   </RevelarGrupo>
 *
 * Uso — lista de líneas de acción:
 *   <RevelarGrupo as="ul" stagger={0.1} className="space-y-4">
 *     <li>…</li>
 *     <li>…</li>
 *   </RevelarGrupo>
 *
 * Nota: el stagger opera sobre los hijos directos del elemento contenedor;
 * el className de layout (grid/flex) debe ir en este mismo componente.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import type { ElementType, ReactNode, Ref } from "react";
import gsap from "gsap";
import { registrarScrollTrigger } from "./registrar";

const useEfectoIsomorfo =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface RevelarGrupoProps {
  children: ReactNode;
  /** Etiqueta HTML contenedora. Default: 'div'. */
  as?: keyof React.JSX.IntrinsicElements;
  /** Segundos entre la entrada de cada hijo directo. Default: 0.08. */
  stagger?: number;
  /** Retraso en segundos antes de iniciar la secuencia. Default: 0. */
  delay?: number;
  /** Desplazamiento vertical inicial en px de cada hijo. Default: 24. */
  y?: number;
  /** Duración de la animación de cada hijo en segundos. Default: 0.6. */
  duracion?: number;
  className?: string;
  /** Si true (default), anima una sola vez; si false, revierte al salir del viewport. */
  once?: boolean;
}

export function RevelarGrupo({
  children,
  as = "div",
  stagger = 0.08,
  delay = 0,
  y = 24,
  duracion = 0.6,
  className,
  once = true,
}: RevelarGrupoProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEfectoIsomorfo(() => {
    const el = ref.current;
    if (!el) return;

    registrarScrollTrigger();
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const hijos = Array.from(el.children);
      if (hijos.length === 0) return;

      // Sobre el fold: animar solo translate (sin ocultar) para no parpadear;
      // conserva el stagger para que la cascada se note. Ver <Revelar>.
      const rect = el.getBoundingClientRect();
      const yaEnViewport = rect.top < window.innerHeight * 0.85;
      if (yaEnViewport) {
        gsap.from(hijos, {
          y: y * 0.5,
          duration: duracion * 0.8,
          delay,
          stagger,
          ease: "power2.out",
          clearProps: "transform",
        });
        return;
      }

      gsap.fromTo(
        hijos,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: duracion,
          delay,
          stagger,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once,
            toggleActions: once
              ? "play none none none"
              : "play none none reverse",
          },
          clearProps: once ? "opacity,visibility,transform" : undefined,
        }
      );
    });

    return () => mm.revert();
  }, [stagger, delay, y, duracion, once]);

  const Tag = as as ElementType;
  return (
    <Tag ref={ref as Ref<HTMLElement>} className={className}>
      {children}
    </Tag>
  );
}

export default RevelarGrupo;
