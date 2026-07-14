import Image from "next/image";
import { cn } from "./cn";

type FotoBase = {
  src: string;
  /** Texto alternativo real. Si la foto es decorativa, pasar cadena vacía. */
  alt: string;
  /** `redonda` = radius 24px (fotos de las slides). `circular` = retratos del Consejo. */
  variante?: "redonda" | "circular";
  /** Clases del contenedor (aspect-ratio, tamaño, posición). */
  className?: string;
  /** Clases de la propia imagen (p. ej. `object-top`). */
  claseImagen?: string;
  sizes?: string;
  priority?: boolean;
};

type FotoProps =
  | (FotoBase & { fill: true; width?: never; height?: never })
  | (FotoBase & { fill?: false; width: number; height: number });

/**
 * Wrapper de next/image con el lenguaje fotográfico de la marca:
 * esquinas muy redondeadas (24px), sin borde y sin sombra (docs/BRAND.md).
 * La variante `circular` es la de los retratos del Consejo Directivo (slide 03)
 * y la foto de la slide 14.
 *
 * Con `fill` hay que dar tamaño al contenedor vía `className`
 * (p. ej. `aspect-[4/3] w-full`) para no provocar CLS.
 */
export default function Foto(props: FotoProps) {
  const {
    src,
    alt,
    variante = "redonda",
    className,
    claseImagen,
    sizes,
    priority,
  } = props;

  const radio = variante === "circular" ? "rounded-full" : "rounded-foto";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-salvia",
        radio,
        variante === "circular" && "aspect-square",
        className,
      )}
    >
      {props.fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "100vw"}
          priority={priority}
          className={cn("object-cover", claseImagen)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={props.width}
          height={props.height}
          sizes={sizes}
          priority={priority}
          className={cn("h-full w-full object-cover", claseImagen)}
        />
      )}
    </div>
  );
}
