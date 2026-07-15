"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState } from "react";

import { BotonAccion, TablaAdmin, type ColumnaTabla } from "@/components/admin";
import { cn } from "@/components/ui";
import { fechaHoraLegible } from "../_formato";
import type { ErrorApi, VersionDocumento } from "../_tipos";

const DEBOUNCE_MS = 1500;

type EstadoGuardado =
  | "inactivo"
  | "editando"
  | "guardando"
  | "guardado"
  | "error";

/** Normaliza la respuesta de GET /versiones a filas tipadas. */
function normalizarVersiones(datos: unknown): VersionDocumento[] {
  if (typeof datos !== "object" || datos === null) return [];
  const lista = (datos as { versiones?: unknown }).versiones;
  if (!Array.isArray(lista)) return [];
  const filas: VersionDocumento[] = [];
  for (const item of lista) {
    if (typeof item !== "object" || item === null) continue;
    const f = item as Record<string, unknown>;
    if (
      typeof f.id === "string" &&
      typeof f.version === "number" &&
      typeof f.contenidoRichtext === "string"
    ) {
      filas.push({
        id: f.id,
        version: f.version,
        contenidoRichtext: f.contenidoRichtext,
        editadoPor: typeof f.editadoPor === "string" ? f.editadoPor : "",
        createdAt: typeof f.createdAt === "string" ? f.createdAt : "",
      });
    }
  }
  return filas;
}

/** Etiqueta corta del autor (uuid abreviado) para el historial. */
function autorCorto(uuid: string): string {
  return uuid ? uuid.slice(0, 8) : "—";
}

export default function EditorVersiones({
  documentId,
}: {
  documentId: string;
}) {
  const [versiones, setVersiones] = useState<VersionDocumento[]>([]);
  const [cargandoVersiones, setCargandoVersiones] = useState(true);
  const [estado, setEstado] = useState<EstadoGuardado>("inactivo");
  const [errorMensaje, setErrorMensaje] = useState<string | undefined>();
  const [ultimaHora, setUltimaHora] = useState<Date | undefined>();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimoGuardadoRef = useRef<string>("");
  const cargadoRef = useRef(false);
  const programarRef = useRef<(html: string) => void>(() => {});

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[300px] px-4 py-3 text-cuerpo text-tinta focus-visible:outline-none",
        "aria-label": "Contenido del documento",
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (!cargadoRef.current) return;
      programarRef.current(ed.getHTML());
    },
  });

  const cargarVersiones = useCallback(async () => {
    const respuesta = await fetch(
      `/api/documentos/${documentId}/versiones`,
      { cache: "no-store" },
    );
    if (!respuesta.ok) {
      const cuerpo = (await respuesta.json().catch(() => ({}))) as ErrorApi;
      throw new Error(cuerpo.mensaje ?? "No se pudieron cargar las versiones.");
    }
    const datos = await respuesta.json();
    return normalizarVersiones(datos);
  }, [documentId]);

  const guardar = useCallback(
    async (html: string) => {
      if (html === ultimoGuardadoRef.current) {
        setEstado("guardado");
        return;
      }
      setEstado("guardando");
      setErrorMensaje(undefined);
      try {
        const respuesta = await fetch(
          `/api/documentos/${documentId}/versiones`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ contenidoRichtext: html }),
          },
        );
        if (respuesta.status === 201) {
          ultimoGuardadoRef.current = html;
          setEstado("guardado");
          setUltimaHora(new Date());
          try {
            setVersiones(await cargarVersiones());
          } catch {
            /* el guardado sí ocurrió; el refresco del historial es secundario */
          }
          return;
        }
        const cuerpo = (await respuesta.json().catch(() => ({}))) as ErrorApi;
        const detalle = cuerpo.errores?.contenidoRichtext?.[0];
        setEstado("error");
        setErrorMensaje(
          detalle ?? cuerpo.mensaje ?? "No se pudo guardar el contenido.",
        );
      } catch {
        setEstado("error");
        setErrorMensaje("Sin conexión con el servidor. Se reintentará al editar.");
      }
    },
    [documentId, cargarVersiones],
  );

  const programar = useCallback(
    (html: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setEstado("editando");
      timerRef.current = setTimeout(() => {
        void guardar(html);
      }, DEBOUNCE_MS);
    },
    [guardar],
  );

  useEffect(() => {
    programarRef.current = programar;
  }, [programar]);

  // Carga inicial: trae las versiones y coloca la más reciente en el editor.
  useEffect(() => {
    if (!editor) return;
    let cancelado = false;
    (async () => {
      setCargandoVersiones(true);
      try {
        const filas = await cargarVersiones();
        if (cancelado) return;
        setVersiones(filas);
        const ultima = filas[0]?.contenidoRichtext;
        if (ultima) {
          editor.commands.setContent(ultima, false);
          ultimoGuardadoRef.current = editor.getHTML();
        } else {
          ultimoGuardadoRef.current = editor.getHTML();
        }
      } catch (e) {
        if (!cancelado) {
          setErrorMensaje(
            e instanceof Error ? e.message : "No se pudieron cargar las versiones.",
          );
        }
      } finally {
        if (!cancelado) {
          setCargandoVersiones(false);
          cargadoRef.current = true;
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [editor, cargarVersiones]);

  // Limpieza del temporizador de guardado al desmontar.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function guardarAhora() {
    if (!editor) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    void guardar(editor.getHTML());
  }

  function cargarVersionEnEditor(version: VersionDocumento) {
    if (!editor) return;
    editor.commands.setContent(version.contenidoRichtext, false);
    editor.commands.focus("end");
    // Marcar como pendiente para que el autoguardado registre la restauración.
    programar(editor.getHTML());
  }

  const columnas: Array<ColumnaTabla<VersionDocumento>> = [
    {
      clave: "version",
      encabezado: "Versión",
      celda: (v) => <span className="font-bold text-verde">v{v.version}</span>,
    },
    {
      clave: "fecha",
      encabezado: "Guardada",
      celda: (v) => fechaHoraLegible(v.createdAt),
    },
    {
      clave: "autor",
      encabezado: "Autor",
      ocultarEnMovil: true,
      celda: (v) => (
        <span className="font-mono text-sm text-tinta-suave">
          {autorCorto(v.editadoPor)}
        </span>
      ),
    },
    {
      clave: "acciones",
      encabezado: "Acciones",
      alinear: "derecha",
      celda: (v) => (
        <BotonAccion
          variante="sutil"
          tamano="sm"
          onClick={() => cargarVersionEnEditor(v)}
        >
          Cargar en el editor
        </BotonAccion>
      ),
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <section aria-labelledby="titulo-editor" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="titulo-editor" className="text-titulo font-bold text-verde">
            Contenido
          </h3>
          <EstadoAutoguardado
            estado={estado}
            ultimaHora={ultimaHora}
            error={errorMensaje}
          />
        </div>

        <BarraHerramientas editor={editor} />

        <div
          className={cn(
            "border border-tinta-suave/20 bg-blanco",
            // Tipografía del contenido editable (sin tocar globals.css).
            "[&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:space-y-3",
            "[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:text-verde",
            "[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:text-verde",
            "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6",
            "[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6",
            "[&_.ProseMirror_strong]:font-bold [&_.ProseMirror_em]:italic",
            "[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-salvia [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-tinta-suave",
          )}
        >
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <p className="px-4 py-6 text-tinta-suave">Cargando editor…</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-tinta-suave">
            El contenido se guarda solo unos segundos después de editar.
          </p>
          <BotonAccion
            variante="secundario"
            tamano="sm"
            onClick={guardarAhora}
            cargando={estado === "guardando"}
            disabled={!editor}
          >
            Guardar ahora
          </BotonAccion>
        </div>
      </section>

      <aside aria-labelledby="titulo-historial" className="flex flex-col gap-3">
        <h3 id="titulo-historial" className="text-titulo font-bold text-verde">
          Historial de versiones
        </h3>
        <TablaAdmin
          columnas={columnas}
          datos={versiones}
          claveFila={(v) => v.id}
          descripcion="Versiones guardadas del contenido del documento."
          cargando={cargandoVersiones}
          vacio="Aún no hay versiones guardadas."
        />
      </aside>
    </div>
  );
}

const ETIQUETA_ESTADO: Record<EstadoGuardado, string> = {
  inactivo: "Sin cambios",
  editando: "Editando…",
  guardando: "Guardando…",
  guardado: "Guardado",
  error: "Error al guardar",
};

function EstadoAutoguardado({
  estado,
  ultimaHora,
  error,
}: {
  estado: EstadoGuardado;
  ultimaHora: Date | undefined;
  error: string | undefined;
}) {
  const esError = estado === "error";
  return (
    <p
      aria-live="polite"
      className={cn(
        "text-sm font-bold",
        esError ? "text-vino" : "text-tinta-suave",
      )}
    >
      {esError && error ? error : ETIQUETA_ESTADO[estado]}
      {estado === "guardado" && ultimaHora ? (
        <span className="font-normal">
          {" "}
          · {fechaHoraLegible(ultimaHora)}
        </span>
      ) : null}
    </p>
  );
}

type Accion = {
  etiqueta: string;
  activo: boolean;
  onClick: () => void;
};

function BarraHerramientas({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const acciones: Accion[] = [
    {
      etiqueta: "Negrita",
      activo: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      etiqueta: "Cursiva",
      activo: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      etiqueta: "Título",
      activo: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      etiqueta: "Lista",
      activo: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      etiqueta: "Lista numerada",
      activo: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      etiqueta: "Cita",
      activo: editor.isActive("blockquote"),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Formato de texto"
      className="flex flex-wrap gap-1 border border-tinta-suave/20 bg-humo p-2"
    >
      {acciones.map((accion) => (
        <button
          key={accion.etiqueta}
          type="button"
          aria-pressed={accion.activo}
          onClick={accion.onClick}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-bold transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2",
            accion.activo
              ? "bg-verde text-blanco"
              : "text-verde hover:bg-verde/10",
          )}
        >
          {accion.etiqueta}
        </button>
      ))}
    </div>
  );
}
