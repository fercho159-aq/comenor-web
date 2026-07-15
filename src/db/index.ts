import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Cliente Drizzle sobre postgres-js.
 * Solo para uso en servidor (route handlers, server actions, server components).
 * En serverless se limita el pool a 1 conexión por instancia.
 *
 * Inicialización PEREZOSA: la conexión se crea en el primer uso, no al importar.
 * Esto permite que `next build` recolecte los módulos de las rutas sin necesitar
 * DATABASE_URL; en tiempo de ejecución sigue fallando con un mensaje claro si falta.
 */

declare global {
  // Reutiliza la conexión en dev para evitar agotar el pool con HMR.
  var __comenorDbClient: ReturnType<typeof postgres> | undefined;
}

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let dbInstancia: DrizzleDb | undefined;

function obtenerDb(): DrizzleDb {
  if (dbInstancia) return dbInstancia;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta la variable de entorno DATABASE_URL");
  }

  const client =
    globalThis.__comenorDbClient ??
    postgres(connectionString, {
      max: 1,
      // El pooler de Neon (transaction mode) no soporta prepared statements.
      prepare: false,
    });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__comenorDbClient = client;
  }

  dbInstancia = drizzle(client, { schema });
  return dbInstancia;
}

/**
 * Proxy que difiere la creación de la conexión hasta el primer acceso.
 * Mantiene la misma API pública (`db.select()`, `db.query...`, etc.).
 */
export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_objetivo, propiedad) {
    const real = obtenerDb();
    const valor = Reflect.get(real, propiedad, real);
    if (typeof valor === "function") {
      return valor.bind(real);
    }
    return valor;
  },
  has(_objetivo, propiedad) {
    return Reflect.has(obtenerDb(), propiedad);
  },
});

export type Db = typeof db;
export { schema };
