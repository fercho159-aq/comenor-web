/**
 * Re-sube la portada ORIGINAL de un evento con el procesamiento nuevo (sin
 * recorte a 16:9) y actualiza events.imagen_path. Un solo uso, para reparar el
 * evento cuya portada se cropeó con la versión vieja de sharp.
 * Uso: EVENT_ID=… ORIGEN=/ruta/cartel.jpeg tsx scripts/resubir-portada.ts
 */
import { readFile } from "node:fs/promises";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { events } from "@/db/schema";
import {
  BUCKET_EVENTOS,
  construirImagenPathEvento,
} from "@/app/admin/eventos/logica";
import { procesarImagenEvento } from "@/app/admin/eventos/imagen";
import { subirObjeto, urlPublica } from "@/lib/storage/objetos";

async function main() {
  const eventId = process.env.EVENT_ID;
  const origen = process.env.ORIGEN;
  if (!eventId || !origen) {
    console.error("Faltan EVENT_ID / ORIGEN");
    process.exit(1);
  }

  const bytes = new Uint8Array(await readFile(origen));
  const procesada = await procesarImagenEvento(bytes);

  const path = construirImagenPathEvento(eventId);
  await subirObjeto(BUCKET_EVENTOS, path, procesada, {
    contentType: "image/webp",
    sobrescribir: true,
  });
  const url = urlPublica(BUCKET_EVENTOS, path);

  const filas = await db
    .update(events)
    .set({ imagenPath: url })
    .where(eq(events.id, eventId))
    .returning({ id: events.id, imagenPath: events.imagenPath });

  console.log("Portada actualizada:", JSON.stringify(filas));
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
