/**
 * Esquemas Zod compartidos cliente/servidor.
 * Regla: cada formulario valida con estos esquemas en el cliente
 * y el route handler RE-VALIDA con el mismo esquema (validación doble).
 */
export {
  registroEventoSchema,
  type RegistroEventoInput,
} from "./registro-evento";
export { contactoSchema, type ContactoInput } from "./contacto";
export {
  eventoSchema,
  modalidadesEvento,
  estadosEvento,
  type EventoInput,
} from "./evento";
export {
  documentoSchema,
  nivelesAcceso,
  type DocumentoInput,
} from "./documento";
export { loginSchema, type LoginInput } from "./login";
