/**
 * Rate limiting para formularios públicos y login — PLAN.md §2.5.
 *
 * `limitar(clave)` implementa una ventana fija:
 * - Con `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` en env usa
 *   Upstash Redis vía su API REST (compatible con serverless/edge, contador
 *   compartido entre instancias). Sin dependencia npm extra.
 * - Sin esas variables (dev local) cae a un limitador en memoria del proceso.
 *   Suficiente para desarrollo; en producción SIEMPRE configurar Upstash,
 *   porque cada lambda de Vercel tiene su propia memoria.
 *
 * Convención de claves: `"{accion}:{ip}"` — p. ej. `login:187.190.x.x`,
 * `registro-evento:187.190.x.x`, `contacto:187.190.x.x`.
 *
 * Incluye además el helper de honeypot (campo oculto que los humanos dejan
 * vacío y los bots llenan) para el registro de eventos y contacto.
 */

/** Resultado de una verificación de límite. */
export interface ResultadoLimite {
  /** false = responder 429 sin procesar nada. */
  permitido: boolean;
  /** Intentos que le quedan a esta clave dentro de la ventana. */
  restantes: number;
  /** Milisegundos hasta que la ventana se reinicia. */
  reiniciaEnMs: number;
}

/** Configuración de una regla de límite. */
export interface OpcionesLimite {
  /** Máximo de intentos por ventana. Default: 10. */
  limite?: number;
  /** Tamaño de la ventana en segundos. Default: 60. */
  ventanaSegundos?: number;
}

const LIMITE_DEFAULT = 10;
const VENTANA_DEFAULT_SEGUNDOS = 60;

// ---------------------------------------------------------------------------
// Backend Upstash (REST, ventana fija con INCR + PEXPIRE NX)
// ---------------------------------------------------------------------------

interface RespuestaPipelineUpstash {
  result?: number | string | null;
  error?: string;
}

async function limitarConUpstash(
  clave: string,
  limite: number,
  ventanaMs: number,
  url: string,
  token: string,
): Promise<ResultadoLimite> {
  const respuesta = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", `ratelimit:${clave}`],
      // NX: solo fija expiración la primera vez → ventana fija real.
      ["PEXPIRE", `ratelimit:${clave}`, String(ventanaMs), "NX"],
      ["PTTL", `ratelimit:${clave}`],
    ]),
    // El rate limiter nunca debe colgar un formulario: timeout corto.
    signal: AbortSignal.timeout(2000),
  });

  if (!respuesta.ok) {
    throw new Error(`Upstash respondió ${respuesta.status}.`);
  }

  const resultados = (await respuesta.json()) as RespuestaPipelineUpstash[];
  const cuenta = Number(resultados[0]?.result ?? 0);
  const ttlMs = Number(resultados[2]?.result ?? ventanaMs);

  return {
    permitido: cuenta <= limite,
    restantes: Math.max(0, limite - cuenta),
    reiniciaEnMs: ttlMs > 0 ? ttlMs : ventanaMs,
  };
}

// ---------------------------------------------------------------------------
// Backend en memoria (fallback de desarrollo)
// ---------------------------------------------------------------------------

interface EntradaMemoria {
  cuenta: number;
  expiraMs: number;
}

const memoria = new Map<string, EntradaMemoria>();

function limitarEnMemoria(
  clave: string,
  limite: number,
  ventanaMs: number,
  ahoraMs: number,
): ResultadoLimite {
  // Limpieza perezosa para que el Map no crezca sin tope en dev.
  if (memoria.size > 10_000) {
    for (const [k, v] of memoria) {
      if (v.expiraMs <= ahoraMs) memoria.delete(k);
    }
  }

  const entrada = memoria.get(clave);
  if (!entrada || entrada.expiraMs <= ahoraMs) {
    memoria.set(clave, { cuenta: 1, expiraMs: ahoraMs + ventanaMs });
    return {
      permitido: limite >= 1,
      restantes: Math.max(0, limite - 1),
      reiniciaEnMs: ventanaMs,
    };
  }

  entrada.cuenta += 1;
  return {
    permitido: entrada.cuenta <= limite,
    restantes: Math.max(0, limite - entrada.cuenta),
    reiniciaEnMs: entrada.expiraMs - ahoraMs,
  };
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Registra un intento para `clave` y dice si se permite.
 *
 * Fail-open deliberado: si Upstash está configurado pero falla (timeout, red),
 * degrada al limitador en memoria en vez de tumbar el formulario — un rate
 * limiter caído no debe convertirse en denial of service propio.
 */
export async function limitar(
  clave: string,
  opciones: OpcionesLimite = {},
): Promise<ResultadoLimite> {
  const limite = opciones.limite ?? LIMITE_DEFAULT;
  const ventanaMs = (opciones.ventanaSegundos ?? VENTANA_DEFAULT_SEGUNDOS) * 1000;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      return await limitarConUpstash(clave, limite, ventanaMs, url, token);
    } catch (error) {
      console.error(
        `[ratelimit] Upstash falló, degradando a memoria: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return limitarEnMemoria(clave, limite, ventanaMs, Date.now());
}

// ---------------------------------------------------------------------------
// Honeypot (PLAN §2.5: honeypot en registro de eventos)
// ---------------------------------------------------------------------------

/**
 * Nombre del campo honeypot. Se renderiza oculto (CSS `position:absolute;
 * left:-9999px` + `tabIndex={-1}` + `autoComplete="off"`, NUNCA
 * `display:none` dentro de un `<label>` visible). Los humanos lo dejan vacío.
 * Nombre "atractivo" para bots a propósito.
 */
export const CAMPO_HONEYPOT = "sitio_web";

/**
 * true = el honeypot venía lleno → es un bot. El handler debe responder como
 * si todo hubiera salido bien (200 genérico) SIN persistir nada, para no
 * revelar la trampa.
 */
export function esHoneypotDisparado(valor: unknown): boolean {
  return typeof valor === "string" && valor.trim().length > 0;
}
