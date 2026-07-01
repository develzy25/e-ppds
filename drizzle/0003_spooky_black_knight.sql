CREATE TABLE `keamanan_offenses` (
	`id` text PRIMARY KEY NOT NULL,
	`santri_id` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`points` integer NOT NULL,
	`date` text NOT NULL,
	`handler_name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`santri_id`) REFERENCES `master_santri`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `keamanan_permits` (
	`id` text PRIMARY KEY NOT NULL,
	`santri_id` text NOT NULL,
	`type` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`status` text NOT NULL,
	`notes` text,
	`checkout_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`santri_id`) REFERENCES `master_santri`(`id`) ON UPDATE cascade ON DELETE restrict
);
