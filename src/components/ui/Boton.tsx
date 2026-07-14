import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "./cn";

type Variante = "primario" | "secundario" | "sobre-oscuro";
type Tamano = "md" | "lg";

type BotonBase = {
  children: ReactNode;
  /** `primario` verde sólido · `secundario` borde verde · `sobre-oscuro` blanco sólido. */
  variante?: Variante;
  tamano?: Tamano;
  /** Ocupa todo el ancho disponible (útil en móvil y en formularios). */
  bloque?: boolean;
  className?: string;
};

type BotonProps =
  | (BotonBase & { href: string } & Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        "href" | "className" | "children"
      >)
  | (BotonBase & { href?: undefined } & Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        "className" | "children"
      >);

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold " +
  "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-verde text-blanco hover:bg-verde-700",
  secundario:
    "border-2 border-verde text-verde hover:bg-verde hover:text-blanco",
  // Sobre fondo verde/vino: invierte el contraste y el anillo de foco (tema-oscuro).
  "sobre-oscuro": "tema-oscuro bg-blanco text-verde hover:bg-salvia",
};

const TAMANOS: Record<Tamano, string> = {
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

/**
 * Botón / CTA de COMENOR. Si recibe `href` renderiza un enlace (next/link para
 * rutas internas, `<a>` para URLs externas y `mailto:`/`tel:`); si no, un `<button>`.
 */
export default function Boton(props: BotonProps) {
  const {
    children,
    variante = "primario",
    tamano = "md",
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

  if (typeof props.href === "string") {
    const { href, ...anclaProps } = resto as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    const esInterno = href.startsWith("/") && !href.startsWith("//");

    if (esInterno) {
      return (
        <Link href={href} className={clases} {...anclaProps}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} className={clases} {...anclaProps}>
        {children}
      </a>
    );
  }

  const botonProps = resto as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={botonProps.type ?? "button"} className={clases} {...botonProps}>
      {children}
    </button>
  );
}
