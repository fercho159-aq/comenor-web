import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Cliente Drizzle sobre postgres-js.
 * Solo para uso en servidor (route handlers, server actions, server components).
 * En serverless se limita el pool a 1 conexión por instancia.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

declare global {
  // Reutiliza la conexión en dev para evitar agotar el pool con HMR.
  var __comenorDbClient: ReturnType<typeof postgres> | undefined;
}

const client =
  globalThis.__comenorDbClient ??
  postgres(connectionString, {
    max: 1,
    // Supabase pooler (transaction mode) no soporta prepared statements.
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__comenorDbClient = client;
}

export const db = drizzle(client, { schema });

export type Db = typeof db;
export { schema };
