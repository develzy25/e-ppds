ALTER TABLE `pengurus_positions` ADD `created_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `pengurus_positions` ADD `updated_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `pengurus_positions` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `pengurus_positions` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `pengurus_positions` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `pengurus_positions` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `pengurus_roles` ADD `created_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `pengurus_roles` ADD `updated_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `pengurus_roles` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `pengurus_roles` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `pengurus_roles` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `pengurus_roles` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD `created_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD `updated_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD `deleted_by` text;