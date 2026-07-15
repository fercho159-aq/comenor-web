"use client";

import type { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

import { BotonAccion, CampoFormulario } from "@/components/admin";
import { cn } from "@/components/ui";
import { formatearFechaHora } from "../_formato";

/** Datos del asistente que devuelve /api/checkin en un check-in válido. */
interface Asistente {
  registrationId: string;
  eventId: string;
  nombre: string;
  cargo: string;
  correo: string;
  organismo: string;
  checkedInAt: string;
}

type TipoResultado = "valido" | "ya_usado" | "invalido" | "error";

interface Resultado {
  tipo: TipoResultado;
  mensaje: string;
  asistente?: Asistente;
}

type Fase = "inactivo" | "escaneando" | "verificando";

const ID_LECTOR = "lector-qr-checkin";

/** Estilo del panel de resultado según el veredicto (verde = válido, resto rojo). */
const ESTILO_RESULTADO: Record<TipoResultado, string> = {
  valido: "border-verde bg-verde text-blanco",
  ya_usado: "border-vino-900 bg-vino-900 text-blanco",
  invalido: "border-vino bg-vino text-blanco",
  error: "border-vino bg-vino text-blanco",
};

const TITULO_RESULTADO: Record<TipoResultado, string> = {
  valido: "Acceso concedido",
  ya_usado: "Código ya utilizado",
  invalido: "Código no válido",
  error: "No se pudo verificar",
};

/**
 * Lector de QR para check-in de asistentes. Escanea con la cámara (getUserMedia
 * vía html5-qrcode), envía el token a POST /api/checkin y muestra el veredicto
 * en verde (válido) o rojo (ya usado / inválido). Incluye entrada manual del
 * token como alternativa accesible cuando no hay cámara.
 */
export default function EscanerCheckin() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  // Evita procesar múltiples decodificaciones del mismo QR en ráfaga.
  const bloqueoRef = useRef(false);
  const [fase, setFase] = useState<Fase>("inactivo");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const [tokenManual, setTokenManual] = useState("");

  const verificar = useCallback(async (token: string) => {
    setFase("verificando");
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      const cuerpo = (data ?? {}) as {
        ok?: boolean;
        asistente?: Asistente;
        mensaje?: string;
        motivo?: string;
      };

      if (res.ok && cuerpo.ok && cuerpo.asistente) {
        setResultado({
          tipo: "valido",
          mensaje: "El asistente puede ingresar.",
          asistente: cuerpo.asistente,
        });
      } else if (res.status === 409) {
        setResultado({
          tipo: cuerpo.motivo === "ya_usado" ? "ya_usado" : "invalido",
          mensaje: cuerpo.mensaje ?? "El código QR no es válido.",
        });
      } else {
        setResultado({
          tipo: "error",
          mensaje:
            cuerpo.mensaje ??
            "No se pudo verificar el código. Intenta de nuevo.",
        });
      }
    } catch {
      setResultado({
        tipo: "error",
        mensaje: "Error de red al verificar el código. Revisa tu conexión.",
      });
    } finally {
      setFase((f) => (f === "verificando" ? "escaneando" : f));
    }
  }, []);

  const alDecodificar = useCallback(
    async (texto: string) => {
      if (bloqueoRef.current) return;
      bloqueoRef.current = true;
      try {
        scannerRef.current?.pause(true);
      } catch {
        // La cámara pudo detenerse ya; ignoramos.
      }
      await verificar(texto);
    },
    [verificar],
  );

  const iniciar = useCallback(async () => {
    setResultado(null);
    setErrorCamara(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(ID_LECTOR);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (texto) => {
          void alDecodificar(texto);
        },
        undefined,
      );
      bloqueoRef.current = false;
      setFase("escaneando");
    } catch {
      setErrorCamara(
        "No se pudo acceder a la cámara. Revisa los permisos del navegador o usa la entrada manual.",
      );
      setFase("inactivo");
    }
  }, [alDecodificar]);

  const detener = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch {
        // Ya estaba detenido.
      }
    }
    setFase("inactivo");
  }, []);

  const escanearOtro = useCallback(() => {
    setResultado(null);
    bloqueoRef.current = false;
    try {
      scannerRef.current?.resume();
      setFase("escaneando");
    } catch {
      setFase("inactivo");
    }
  }, []);

  const enviarManual = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const token = tokenManual.trim();
      if (!token) return;
      setTokenManual("");
      void verificar(token);
    },
    [tokenManual, verificar],
  );

  // Detiene la cámara al desmontar (libera el hardware).
  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().catch(() => undefined);
      }
    };
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Columna de cámara */}
      <section className="flex flex-col gap-4">
        <div className="border border-tinta-suave/20 bg-blanco p-4">
          <div
            id={ID_LECTOR}
            className="mx-auto aspect-square w-full max-w-sm overflow-hidden bg-verde-900"
            aria-hidden="true"
          />
          {fase === "inactivo" && !errorCamara ? (
            <p className="mt-3 text-center text-sm text-tinta-suave">
              Inicia la cámara para escanear el código QR del asistente.
            </p>
          ) : null}
          {fase === "verificando" ? (
            <p className="mt-3 text-center text-sm text-tinta-suave">
              Verificando código…
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {fase === "inactivo" ? (
            <BotonAccion onClick={() => void iniciar()} variante="primario">
              Iniciar cámara
            </BotonAccion>
          ) : (
            <BotonAccion onClick={() => void detener()} variante="secundario">
              Detener cámara
            </BotonAccion>
          )}
        </div>

        {errorCamara ? (
          <p
            role="alert"
            className="border border-vino bg-vino/10 px-4 py-3 text-sm text-vino"
          >
            {errorCamara}
          </p>
        ) : null}

        {/* Entrada manual del token (alternativa accesible sin cámara). */}
        <form
          onSubmit={enviarManual}
          className="border border-tinta-suave/20 bg-blanco p-4"
        >
          <CampoFormulario
            etiqueta="Token manual"
            ayuda="Pega el token del QR si no puedes escanearlo con la cámara."
            value={tokenManual}
            onChange={(e) => setTokenManual(e.target.value)}
            placeholder="Token del código QR"
          />
          <BotonAccion
            type="submit"
            variante="secundario"
            tamano="sm"
            cargando={fase === "verificando"}
          >
            Verificar token
          </BotonAccion>
        </form>
      </section>

      {/* Columna de resultado */}
      <section aria-live="polite" aria-atomic="true" className="min-h-40">
        {resultado ? (
          <div
            className={cn(
              "flex h-full flex-col gap-3 border-2 p-6",
              ESTILO_RESULTADO[resultado.tipo],
            )}
          >
            <p className="text-sm font-bold uppercase tracking-wide opacity-90">
              {resultado.tipo === "valido" ? "Válido" : "Detenido"}
            </p>
            <h2 className="text-titulo font-bold">
              {TITULO_RESULTADO[resultado.tipo]}
            </h2>
            <p className="text-cuerpo">{resultado.mensaje}</p>

            {resultado.asistente ? (
              <dl className="mt-2 grid grid-cols-1 gap-2 border-t border-blanco/25 pt-4 text-sm">
                <div>
                  <dt className="font-bold uppercase tracking-wide opacity-80">
                    Asistente
                  </dt>
                  <dd>{resultado.asistente.nombre}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide opacity-80">
                    Cargo
                  </dt>
                  <dd>{resultado.asistente.cargo}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide opacity-80">
                    Organismo
                  </dt>
                  <dd>{resultado.asistente.organismo}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide opacity-80">
                    Ingreso registrado
                  </dt>
                  <dd>{formatearFechaHora(resultado.asistente.checkedInAt)}</dd>
                </div>
              </dl>
            ) : null}

            <div className="mt-auto pt-4">
              <BotonAccion
                onClick={escanearOtro}
                variante="secundario"
                className="border-blanco text-blanco hover:bg-blanco hover:text-verde"
              >
                Escanear otro
              </BotonAccion>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center border border-dashed border-tinta-suave/40 bg-blanco p-6 text-center text-tinta-suave">
            El resultado del escaneo aparecerá aquí.
          </div>
        )}
      </section>
    </div>
  );
}
