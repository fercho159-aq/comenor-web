/**
 * Render del token QR firmado a una imagen PNG embebible (data URI).
 *
 * El token lo firma `@/lib/qr/token` (HMAC-SHA256); aquí SOLO se dibuja el QR.
 * El contenido del QR es el token completo: el flujo de check-in lo lee, lo
 * verifica con `verificarToken` y lo cruza contra `registrations.qr_token_hash`.
 *
 * Se devuelve un `data:image/png;base64,...` para incrustarlo directamente en el
 * correo de confirmación (los clientes de correo no descargan recursos remotos
 * de forma fiable). Nivel de corrección "M": tolera manchas de tinta/pantalla
 * sin inflar el tamaño del código.
 */
import QRCode from "qrcode";

export async function generarQrDataUri(contenido: string): Promise<string> {
  return QRCode.toDataURL(contenido, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 300,
  });
}
