/**
 * /admin/destinatarios — alias hacia /admin/notificaciones.
 *
 * La navegación del LayoutAdmin compartido enlaza "Destinatarios" a
 * `/admin/destinatarios`, mientras que la gestión vive en
 * `/admin/notificaciones` (carpeta asignada a este módulo). Este redirect evita
 * un 404 en ese enlace sin tocar el componente compartido.
 */
import { redirect } from "next/navigation";

export default function DestinatariosRedirectPage() {
  redirect("/admin/notificaciones");
}
