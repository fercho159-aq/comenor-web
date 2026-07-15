import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/components/ui";

type Variante = "primario" | "secundario" | "peligro" | "sutil";
type Tamano = "sm" | "md";

type BotonAccionBase = {
  children: ReactNode;
  /**
   * `primario` verde sólido · `secundario` borde verde · `peligro` vino (borrar,
   * cancelar, rechazar) · `sutil` texto sin fondo para acciones de tabla.
   */
  variante?: Variante;
  tamano?: Tamano;
  /** Muestra estado de carga y deshabilita la acción (evita doble envío). */
  cargando?: boolean;
  /** Icono opcional a la izquierda del texto. */
  icono?: ReactNode;
  bloque?: boolean;
  className?: string;
};

type BotonAccionProps =
  | (BotonAccionBase & { href: string } & Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        "href" | "className" | "children"
      >)
  | (BotonAccionBase & { href?: undefined } & Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        "className" | "children"
      >);

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold " +
  "transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-verde text-blanco hover:bg-verde-700",
  secundario:
    "border-2 border-verde text-verde hover:bg-verde hover:text-blanco",
  peligro: "bg-vino text-blanco hover:bg-vino-900",
  sutil: "text-verde hover:bg-verde/10",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
};

/**
 * Botón de acción del panel admin. Como `Boton` del sitio público, si recibe
 * `href` renderiza un enlace; si no, un `<button>`. Añade estado de carga y una
 * variante `peligro`/`sutil` propias de operaciones administrativas.
 */
export default function BotonAccion(props: BotonAccionProps) {
  const {
    children,
    variante = "primario",
    tamano = "md",
    cargando = false,
    icono,
    bloque = false,
    className,
    ...resto
  } = props;

  const clases = cn(
    BASE,
    VARIANTES[variante],
    TAMANOS[tamano],
    bloque && "w-full",
    className,
  );

  const contenido = (
    <>
      {cargando ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        icono
      )}
      {children}
    </>
  );

  if (typeof props.href === "string") {
    const { href, ...anclaProps } =
      resto as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    const esInterno = href.startsWith("/") && !href.startsWith("//");

    if (esInterno) {
      return (
        <Link href={href} className={clases} {...anclaProps}>
          {contenido}
        </Link>
      );
    }
    return (
      <a href={href} className={clases} {...anclaProps}>
        {contenido}
      </a>
    );
  }

  const botonProps = resto as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      {...botonProps}
      type={botonProps.type ?? "button"}
      className={clases}
      aria-busy={cargando || undefined}
      disabled={botonProps.disabled || cargando}
    >
      {contenido}
    </button>
  );
}
