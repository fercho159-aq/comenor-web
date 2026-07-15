import type { Metadata } from "next";
import { Contenedor, Eyebrow, Titulo } from "@/components/ui";
import FormularioLogin from "./FormularioLogin";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Acceso al micrositio de miembros y al panel de administración de COMENOR.",
  robots: { index: false, follow: false },
};

/** `next` (opcional): ruta interna a la que volver tras iniciar sesión. */
type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

/**
 * Pantalla de inicio de sesión. Server Component: solo resuelve el destino y
 * renderiza el formulario cliente, que valida y llama a la server action.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const destino = typeof next === "string" ? next : undefined;

  return (
    <Contenedor className="py-16 sm:py-24">
      <div className="mx-auto w-full max-w-md">
        <Eyebrow>Área de miembros</Eyebrow>
        <Titulo as="h1" tamano="display" className="mt-2">
          Iniciar sesión
        </Titulo>
        <p className="mt-4 text-cuerpo text-tinta">
          Ingresa con tu correo institucional para acceder a los documentos del
          Consejo, los recursos de asociados y el panel de administración.
        </p>

        <FormularioLogin next={destino} />
      </div>
    </Contenedor>
  );
}
