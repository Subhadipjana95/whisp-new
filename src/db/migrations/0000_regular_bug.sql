CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`parent_type` text NOT NULL,
	`type` text NOT NULL,
	`uri` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`mime_type` text,
	`size_bytes` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `attachments_parent_idx` ON `attachments` (`parent_id`,`parent_type`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notes_updated_at_idx` ON `notes` (`updated_at`);--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`due_at` integer NOT NULL,
	`is_done` integer DEFAULT false NOT NULL,
	`notification_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reminders_due_at_idx` ON `reminders` (`due_at`);--> statement-breakpoint
CREATE INDEX `reminders_is_done_idx` ON `reminders` (`is_done`);