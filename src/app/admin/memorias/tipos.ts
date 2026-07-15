/**
 * DTOs planos (serializables) que las páginas server pasan a los componentes
 * cliente. Nada de instancias de Date ni funciones cruzan la frontera.
 */

/** Fila del listado de galerías. */
export type GaleriaFila = {
  id: string;
  titulo: string;
  anio: number;
  publicada: boolean;
  totalFotos: number;
  eventoNombre: string | null;
  /** URL firmada de la portada (vida corta) o null si no tiene. */
  portadaUrl: string | null;
};

/** Foto lista para la rejilla del gestor. */
export type FotoFila = {
  id: string;
  storagePath: string;
  orden: number;
  esPortada: boolean;
  /** URL firmada de vida corta para la miniatura. */
  url: string | null;
};

/** Opción de evento para el selector de asociación. */
export type OpcionEvento = {
  id: string;
  etiqueta: string;
};
