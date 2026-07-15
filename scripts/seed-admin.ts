/**
 * Siembra un usuario admin de COMENOR.
 * Usa la API de better-auth (hash de contraseña correcto) y marca user.rol='admin'.
 * Uso: SEED_EMAIL=… SEED_PASSWORD=… AUTH_PERMITIR_REGISTRO=true tsx scripts/seed-admin.ts
 * (AUTH_PERMITIR_REGISTRO=true habilita el alta SOLO para este proceso.)
 */
import { eq } from "drizzle-orm";
import { APIError } from "better-auth";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import { user } from "@/db/schema";

async function main() {
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;
  const name = process.env.SEED_NAME ?? "Dirección COMENOR";

  if (!email || !password) {
    console.error("Faltan SEED_EMAIL / SEED_PASSWORD");
    process.exit(1);
  }

  try {
    await auth.api.signUpEmail({ body: { email, password, name } });
    console.log("Usuario creado:", email);
  } catch (error) {
    if (error instanceof APIError) {
      console.log("El usuario ya existía; solo se ajusta el rol:", email);
    } else {
      throw error;
    }
  }

  const filas = await db
    .update(user)
    .set({ rol: "admin" })
    .where(eq(user.email, email))
    .returning({ id: user.id, email: user.email, rol: user.rol });

  console.log("Rol asignado:", JSON.stringify(filas));
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
