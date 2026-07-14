/**
 * Esquema de base de datos COMENOR — PLAN.md sección 1.5.
 * Migraciones SOLO por drizzle-kit (archivos versionados en /drizzle).
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums de Postgres
// ---------------------------------------------------------------------------

/** Tipo de perfil de usuario. */
export const tipoPerfilEnum = pgEnum("tipo_perfil", [
  "consejo",
  "asociados",
  "admin",
]);

/** Nivel de acceso de un documento. */
export const nivelAccesoEnum = pgEnum("nivel_acceso", [
  "publico",
  "asociados",
  "consejo",
]);

/** Modalidad de un evento. */
export const modalidadEnum = pgEnum("modalidad", [
  "presencial",
  "virtual",
  "hibrida",
]);

/** Estado del ciclo de vida de un evento. */
export const estadoEventoEnum = pgEnum("estado_evento", [
  "borrador",
  "programado",
  "en_curso",
  "finalizado",
  "cancelado",
]);

/** Estado de pago de un registro a evento. */
export const estadoPagoEnum = pgEnum("estado_pago", [
  "gratuito",
  "pendiente",
  "aprobado",
  "rechazado",
]);

// ---------------------------------------------------------------------------
// Tablas
// ---------------------------------------------------------------------------

/** Perfiles de usuario (espeja auth de Supabase; id = auth.users.id). */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  tipo: tipoPerfilEnum("tipo").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Documentos normativos / actas / memorias. */
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  mes: integer("mes").notNull(),
  anio: integer("anio").notNull(),
  nivelAcceso: nivelAccesoEnum("nivel_acceso").notNull(),
  tipo: text("tipo").notNull(),
  storagePath: text("storage_path").notNull(),
  formato: text("formato").notNull(),
  creadoPor: uuid("creado_por")
    .notNull()
    .references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Versiones editables (richtext) de un documento. */
export const documentVersions = pgTable("document_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  contenidoRichtext: text("contenido_richtext").notNull(),
  version: integer("version").notNull(),
  editadoPor: uuid("editado_por")
    .notNull()
    .references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Eventos — alimenta el calendario público. Costo SIEMPRE en centavos MXN. */
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nombre: text("nombre").notNull(),
    slug: text("slug").notNull(),
    fecha: timestamp("fecha", { withTimezone: true }).notNull(),
    sede: text("sede").notNull(),
    modalidad: modalidadEnum("modalidad").notNull(),
    costoCentavos: integer("costo_centavos").notNull().default(0),
    cupo: integer("cupo"),
    estado: estadoEventoEnum("estado").notNull().default("borrador"),
    descripcion: text("descripcion").notNull(),
    imagenPath: text("imagen_path"),
    publicado: boolean("publicado").notNull().default(false),
    registroAbierto: boolean("registro_abierto").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("events_slug_idx").on(table.slug)],
);

/**
 * Registros a eventos.
 * TODOS los campos de contacto son NOT NULL a nivel de columna
 * (tercera línea de defensa después de Zod cliente y servidor).
 */
export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    nombre: text("nombre").notNull(),
    cargo: text("cargo").notNull(),
    correo: text("correo").notNull(),
    celular: text("celular").notNull(),
    organismo: text("organismo").notNull(),
    solicitante: text("solicitante").notNull(),
    estadoPago: estadoPagoEnum("estado_pago").notNull().default("pendiente"),
    mpPaymentId: text("mp_payment_id"),
    qrTokenHash: text("qr_token_hash"),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Único: idempotencia de webhooks de Mercado Pago.
    uniqueIndex("registrations_mp_payment_id_idx").on(table.mpPaymentId),
    index("registrations_event_id_idx").on(table.eventId),
  ],
);

/** Bitácora cruda de webhooks de Mercado Pago (idempotencia y auditoría). */
export const paymentsLog = pgTable(
  "payments_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "restrict" }),
    mpEvent: text("mp_event").notNull(),
    payloadJson: jsonb("payload_json").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("payments_log_registration_id_idx").on(table.registrationId)],
);

/** Galerías fotográficas (Memorias). */
export const galleries = pgTable("galleries", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  eventoId: uuid("evento_id").references(() => events.id, {
    onDelete: "set null",
  }),
  anio: integer("anio").notNull(),
  publicada: boolean("publicada").notNull().default(false),
  portada: text("portada"),
  orden: integer("orden").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Fotos de una galería. */
export const galleryPhotos = pgTable(
  "gallery_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    galleryId: uuid("gallery_id")
      .notNull()
      .references(() => galleries.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    orden: integer("orden").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("gallery_photos_gallery_id_idx").on(table.galleryId)],
);

/** Bitácora de acciones administrativas (auditoría cotizada). */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actor: uuid("actor")
      .notNull()
      .references(() => profiles.id),
    accion: text("accion").notNull(),
    entidad: text("entidad").notNull(),
    entidadId: text("entidad_id").notNull(),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("audit_log_entidad_idx").on(table.entidad, table.entidadId)],
);

/** Destinatarios de notificaciones documentales por correo. */
export const emailRecipients = pgTable(
  "email_recipients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    correo: text("correo").notNull(),
    perfil: tipoPerfilEnum("perfil").notNull(),
    activo: boolean("activo").notNull().default(true),
  },
  (table) => [uniqueIndex("email_recipients_correo_idx").on(table.correo)],
);

// ---------------------------------------------------------------------------
// Tipos inferidos (select / insert) para consumo en backend y admin
// ---------------------------------------------------------------------------

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type NewDocumentVersion = typeof documentVersions.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;
export type PaymentLog = typeof paymentsLog.$inferSelect;
export type NewPaymentLog = typeof paymentsLog.$inferInsert;
export type Gallery = typeof galleries.$inferSelect;
export type NewGallery = typeof galleries.$inferInsert;
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type NewGalleryPhoto = typeof galleryPhotos.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
export type EmailRecipient = typeof emailRecipients.$inferSelect;
export type NewEmailRecipient = typeof emailRecipients.$inferInsert;
