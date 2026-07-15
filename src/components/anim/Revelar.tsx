"use client";

/**
 * <Revelar> — Primitiva de animación de entrada al hacer scroll (GSAP + ScrollTrigger).
 *
 * Revela sus children con un fade + leve translate-up cuando la sección entra
 * en el viewport (start "top 85%"). Sobrio e institucional.
 *
 * Garantías:
 * - SSR-safe: el contenido se renderiza visible en el HTML del servidor.
 *   El estado inicial (opacity 0, y+24) se aplica SOLO en cliente dentro del
 *   efecto (gsap.fromTo). Si el JS no carga, el contenido queda visible.
 * - prefers-reduced-motion: reduce → NO se anima nada; el contenido aparece
 *   visible y estático desde el inicio (gsap.matchMedia).
 * - Sin CLS: solo se animan transform/opacity, nunca propiedades de layout.
 * - Cleanup: matchMedia().revert() al desmontar.
 *
 * Uso — envolver una sección:
 *   <Revelar as="section" className="py-16">
 *     <h2>Quiénes somos</h2>
 *     <p>…</p>
 *   </Revelar>
 *
 * Uso — con retraso escalonado manual:
 *   <Revelar delay={0.15}><p>Segundo bloque</p></Revelar>
 *
 * Para listas/grids con stagger automático de hijos, usar <RevelarGrupo>.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import type { ElementType, ReactNode, Ref } from "react";
import gsap from "gsap";
import { registrarScrollTrigger } from "./registrar";

const useEfectoIsomorfo =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface RevelarProps {
  children: ReactNode;
  /** Etiqueta HTML contenedora. Default: 'div'. */
  as?: keyof React.JSX.IntrinsicElements;
  /** Retraso en segundos antes de iniciar la animación. Default: 0. */
  delay?: number;
  /** Desplazamiento vertical inicial en px (translate-up). Default: 24. */
  y?: number;
  /** Duración de la animación en segundos. Default: 0.6. */
  duracion?: number;
  className?: string;
  /** Si true (default), anima una sola vez; si false, revierte al salir del viewport. */
  once?: boolean;
}

export function Revelar({
  children,
  as = "div",
  delay = 0,
  y = 24,
  duracion = 0.6,
  className,
  once = true,
}: RevelarProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEfectoIsomorfo(() => {
    const el = ref.current;
    if (!el) return;

    registrarScrollTrigger();
    const mm = gsap.matchMedia();

    // Solo anima si el usuario NO pidió movimiento reducido.
    // Con "reduce" no se agrega ningún tween: el contenido queda visible tal
    // como llegó del SSR (fail-safe de accesibilidad AA).
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Si el elemento YA está dentro del viewport al montar (contenido sobre
      // el fold), ocultarlo con autoAlpha:0 provocaría un parpadeo
      // visible(SSR)→oculto(hidratación)→fade. En ese caso NO tocamos opacity:
      // animamos solo un translate-up sutil, así el contenido nunca desaparece.
      const rect = el.getBoundingClientRect();
      const yaEnViewport = rect.top < window.innerHeight * 0.85;
      if (yaEnViewport) {
        gsap.from(el, {
          y: y * 0.5,
          duration: duracion * 0.8,
          delay,
          ease: "power2.out",
          clearProps: "transform",
        });
        return;
      }

      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: duracion,
          delay,
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
  }, [delay, y, duracion, once]);

  const Tag = as as ElementType;
  return (
    <Tag ref={ref as Ref<HTMLElement>} className={className}>
      {children}
    </Tag>
  );
}

export default Revelar;
