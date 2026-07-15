CREATE TYPE "public"."estado_evento" AS ENUM('borrador', 'programado', 'en_curso', 'finalizado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."estado_pago" AS ENUM('gratuito', 'pendiente', 'aprobado', 'rechazado');--> statement-breakpoint
CREATE TYPE "public"."modalidad" AS ENUM('presencial', 'virtual', 'hibrida');--> statement-breakpoint
CREATE TYPE "public"."nivel_acceso" AS ENUM('publico', 'asociados', 'consejo');--> statement-breakpoint
CREATE TYPE "public"."tipo_perfil" AS ENUM('consejo', 'asociados', 'admin');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" uuid NOT NULL,
	"accion" text NOT NULL,
	"entidad" text NOT NULL,
	"entidad_id" text NOT NULL,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"contenido_richtext" text NOT NULL,
	"version" integer NOT NULL,
	"editado_por" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"mes" integer NOT NULL,
	"anio" integer NOT NULL,
	"nivel_acceso" "nivel_acceso" NOT NULL,
	"tipo" text NOT NULL,
	"storage_path" text NOT NULL,
	"formato" text NOT NULL,
	"creado_por" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"correo" text NOT NULL,
	"perfil" "tipo_perfil" NOT NULL,
	"activo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"slug" text NOT NULL,
	"fecha" timestamp with time zone NOT NULL,
	"sede" text NOT NULL,
	"modalidad" "modalidad" NOT NULL,
	"costo_centavos" integer DEFAULT 0 NOT NULL,
	"cupo" integer,
	"estado" "estado_evento" DEFAULT 'borrador' NOT NULL,
	"descripcion" text NOT NULL,
	"imagen_path" text,
	"publicado" boolean DEFAULT false NOT NULL,
	"registro_abierto" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "galleries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"evento_id" uuid,
	"anio" integer NOT NULL,
	"publicada" boolean DEFAULT false NOT NULL,
	"portada" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"mp_event" text NOT NULL,
	"mp_payment_id" text,
	"payload_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tipo" "tipo_perfil" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"cargo" text NOT NULL,
	"correo" text NOT NULL,
	"celular" text NOT NULL,
	"organismo" text NOT NULL,
	"solicitante" text NOT NULL,
	"estado_pago" "estado_pago" DEFAULT 'pendiente' NOT NULL,
	"mp_payment_id" text,
	"qr_token_hash" text,
	"checked_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_profiles_id_fk" FOREIGN KEY ("actor") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_editado_por_profiles_id_fk" FOREIGN KEY ("editado_por") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_creado_por_profiles_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_evento_id_events_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments_log" ADD CONSTRAINT "payments_log_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_entidad_idx" ON "audit_log" USING btree ("entidad","entidad_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_recipients_correo_idx" ON "email_recipients" USING btree ("correo");--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "gallery_photos_gallery_id_idx" ON "gallery_photos" USING btree ("gallery_id");--> statement-breakpoint
CREATE INDEX "payments_log_registration_id_idx" ON "payments_log" USING btree ("registration_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_log_mp_payment_event_idx" ON "payments_log" USING btree ("mp_payment_id","mp_event");--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_mp_payment_id_idx" ON "registrations" USING btree ("mp_payment_id");--> statement-breakpoint
CREATE INDEX "registrations_event_id_idx" ON "registrations" USING btree ("event_id");