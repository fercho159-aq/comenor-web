import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registrado = false;

/**
 * Registra ScrollTrigger en GSAP una sola vez.
 * Debe llamarse únicamente desde un efecto de cliente
 * (los componentes de este directorio ya lo hacen).
 */
export function registrarScrollTrigger(): void {
  if (!registrado) {
    gsap.registerPlugin(ScrollTrigger);
    registrado = true;
  }
}
