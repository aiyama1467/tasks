CREATE TABLE "feed_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"source_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"author" text,
	"thumbnail_url" text,
	"published_at" timestamp,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_saved" boolean DEFAULT false NOT NULL,
	"converted_to_task_id" uuid,
	"converted_to_backlog_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"source_type" text DEFAULT 'rss' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_fetched_at" timestamp,
	"fetch_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_source_id_feed_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."feed_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_converted_to_task_id_tasks_id_fk" FOREIGN KEY ("converted_to_task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_converted_to_backlog_id_backlog_items_id_fk" FOREIGN KEY ("converted_to_backlog_id") REFERENCES "public"."backlog_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feed_items_user_id_idx" ON "feed_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feed_items_source_id_idx" ON "feed_items" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "feed_items_url_user_idx" ON "feed_items" USING btree ("user_id","url");--> statement-breakpoint
CREATE INDEX "feed_sources_user_id_idx" ON "feed_sources" USING btree ("user_id");
