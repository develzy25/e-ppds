CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_attachment_entity` ON `attachments` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `background_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`job_name` text NOT NULL,
	`payload` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`error_log` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`started_at` integer,
	`completed_at` integer
);
--> statement-breakpoint
CREATE TABLE `backup_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`backup_time` text NOT NULL,
	`backup_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`status` text NOT NULL,
	`filepath` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `document_sequences` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`prefix` text NOT NULL,
	`current_value` integer DEFAULT 0 NOT NULL,
	`suffix` text,
	`period_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	FOREIGN KEY (`period_id`) REFERENCES `periodes`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`file_size` integer NOT NULL,
	`uploader_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `master_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `master_permissions_name_unique` ON `master_permissions` (`name`);--> statement-breakpoint
CREATE TABLE `master_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `master_roles_name_unique` ON `master_roles` (`name`);--> statement-breakpoint
CREATE TABLE `notification_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`notification_id` text NOT NULL,
	`user_id` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`type` text DEFAULT 'info' NOT NULL,
	`category` text DEFAULT 'general' NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`link` text,
	`period_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`period_id`) REFERENCES `periodes`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `periodes` (
	`id` text PRIMARY KEY NOT NULL,
	`year_name` text NOT NULL,
	`status` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `pondoks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`phone` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schema_migrations` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`applied_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`inventory_id` text NOT NULL,
	`item_type` text NOT NULL,
	`quantity` real NOT NULL,
	`movement_type` text NOT NULL,
	`reference_id` text,
	`notes` text,
	`timestamp` text NOT NULL,
	`period_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	FOREIGN KEY (`period_id`) REFERENCES `periodes`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `system_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text DEFAULT 'default' NOT NULL,
	`module` text NOT NULL,
	`entity_name` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`before_data` text,
	`after_data` text,
	`performed_by` text NOT NULL,
	`ip_address` text,
	`device` text,
	`browser` text,
	`user_agent` text,
	`request_id` text,
	`session_id` text,
	`remarks` text,
	`performed_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `system_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_name` text NOT NULL,
	`payload` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`processed_at` text
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`pondok_id` text NOT NULL,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `system_settings_key_unique` ON `system_settings` (`key`);--> statement-breakpoint
CREATE TABLE `task_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`task_unit_id` text NOT NULL,
	`assigned_by` text NOT NULL,
	`assigned_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`period_id` text NOT NULL,
	`status` text NOT NULL,
	`appointed_at` text,
	`ended_at` text,
	`appointment_letter` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`role_id`) REFERENCES `master_roles`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`period_id`) REFERENCES `periodes`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unq_user_role_period` ON `user_roles` (`user_id`,`role_id`,`period_id`);--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	`ip_address` text,
	`device` text,
	`browser` text,
	`os` text,
	`user_agent` text,
	`last_activity` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_token_unique` ON `user_sessions` (`token`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`avatar_url` text,
	`password_hash` text NOT NULL,
	`pin` text,
	`failed_login_attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`session_version` integer DEFAULT 1 NOT NULL,
	`permission_version` integer DEFAULT 1 NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `approval_histories` (
	`id` text PRIMARY KEY NOT NULL,
	`approval_request_id` text NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`note` text,
	`timestamp` text NOT NULL,
	FOREIGN KEY (`approval_request_id`) REFERENCES `approval_requests`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `approval_policies` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`min_amount` real DEFAULT 0 NOT NULL,
	`max_amount` real,
	`required_roles` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`period_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	FOREIGN KEY (`period_id`) REFERENCES `periodes`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`status` text NOT NULL,
	`period_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	FOREIGN KEY (`period_id`) REFERENCES `periodes`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `approval_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`approval_request_id` text NOT NULL,
	`step_order` integer NOT NULL,
	`role_id` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`approval_request_id`) REFERENCES `approval_requests`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`role_id`) REFERENCES `master_roles`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `master_academic_year` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `master_block` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `master_class` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`school_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`school_id`) REFERENCES `master_school`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `master_department` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `master_pengurus` (
	`id` text PRIMARY KEY NOT NULL,
	`santri_id` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`status_aktif` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`santri_id`) REFERENCES `master_santri`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `master_pengurus_email_unique` ON `master_pengurus` (`email`);--> statement-breakpoint
CREATE TABLE `master_period` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `master_permission` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `master_permission_name_unique` ON `master_permission` (`name`);--> statement-breakpoint
CREATE TABLE `master_position` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`department_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`department_id`) REFERENCES `master_department`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `master_role` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `master_role_name_unique` ON `master_role` (`name`);--> statement-breakpoint
CREATE TABLE `master_room` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`capacity` integer NOT NULL,
	`block_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`block_id`) REFERENCES `master_block`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `master_santri` (
	`id` text PRIMARY KEY NOT NULL,
	`nis` text NOT NULL,
	`name` text NOT NULL,
	`full_name` text,
	`student_status` text,
	`admission_type` text,
	`entry_year` text,
	`registration_wave` text,
	`registration_number` text,
	`previous_school` text,
	`boarding_entry_date` text,
	`exit_year` text,
	`exit_date` text,
	`exit_reason` text,
	`exit_notes` text,
	`photo_url` text,
	`nisn` text,
	`nik` text,
	`family_card_number` text,
	`birth_place` text,
	`birth_date` text,
	`gender` text NOT NULL,
	`sibling_count` integer,
	`child_order` integer,
	`religion` text,
	`hobby` text,
	`ambition` text,
	`nationality` text,
	`blood_type` text,
	`height` integer,
	`weight` integer,
	`medical_history` text,
	`allergies` text,
	`emergency_contact_name` text,
	`emergency_contact_phone` text,
	`student_phone` text,
	`student_email` text,
	`address_line1` text,
	`address_line2` text,
	`hamlet` text,
	`village` text,
	`rt` text,
	`rw` text,
	`district` text,
	`city` text,
	`province` text,
	`postal_code` text,
	`father_nik` text,
	`father_name` text,
	`father_birth_place` text,
	`father_birth_date` text,
	`father_occupation` text,
	`father_company` text,
	`father_job_address` text,
	`father_education` text,
	`father_phone` text,
	`father_income` text,
	`mother_nik` text,
	`mother_name` text,
	`mother_birth_place` text,
	`mother_birth_date` text,
	`mother_occupation` text,
	`mother_company` text,
	`mother_job_address` text,
	`mother_education` text,
	`mother_phone` text,
	`mother_income` text,
	`status_aktif` text NOT NULL,
	`room_id` text,
	`class_formal_id` text,
	`class_diniyah_id` text,
	`academic_year_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`room_id`) REFERENCES `master_room`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`class_formal_id`) REFERENCES `master_class`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`class_diniyah_id`) REFERENCES `master_class`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`academic_year_id`) REFERENCES `master_academic_year`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `master_santri_nis_unique` ON `master_santri` (`nis`);--> statement-breakpoint
CREATE INDEX `idx_santri_academic_year` ON `master_santri` (`academic_year_id`);--> statement-breakpoint
CREATE TABLE `master_school` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `pengurus_positions` (
	`id` text PRIMARY KEY NOT NULL,
	`pengurus_id` text NOT NULL,
	`position_id` text NOT NULL,
	`period_id` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`pengurus_id`) REFERENCES `master_pengurus`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`position_id`) REFERENCES `master_position`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`period_id`) REFERENCES `master_period`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unq_pengurus_position_period` ON `pengurus_positions` (`pengurus_id`,`position_id`,`period_id`);--> statement-breakpoint
CREATE TABLE `pengurus_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`pengurus_id` text NOT NULL,
	`role_id` text NOT NULL,
	FOREIGN KEY (`pengurus_id`) REFERENCES `master_pengurus`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`role_id`) REFERENCES `master_role`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `master_role`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`permission_id`) REFERENCES `master_permission`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `keuangan_buku_kas` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_date` text NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`description` text NOT NULL,
	`reference_id` text,
	`saldo` real NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `keuangan_master_jenis_tagihan` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `keuangan_master_tarif` (
	`id` text PRIMARY KEY NOT NULL,
	`jenis_tagihan_id` text NOT NULL,
	`academic_year_id` text NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`jenis_tagihan_id`) REFERENCES `keuangan_master_jenis_tagihan`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`academic_year_id`) REFERENCES `master_academic_year`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `keuangan_pembayaran` (
	`id` text PRIMARY KEY NOT NULL,
	`receipt_number` text NOT NULL,
	`santri_id` text NOT NULL,
	`total_paid` real NOT NULL,
	`payment_method` text NOT NULL,
	`payment_date` text NOT NULL,
	`cashier_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`santri_id`) REFERENCES `master_santri`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `keuangan_pembayaran_receipt_number_unique` ON `keuangan_pembayaran` (`receipt_number`);--> statement-breakpoint
CREATE TABLE `keuangan_pembayaran_detail` (
	`id` text PRIMARY KEY NOT NULL,
	`pembayaran_id` text NOT NULL,
	`tagihan_id` text NOT NULL,
	`amount_paid` real NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`pembayaran_id`) REFERENCES `keuangan_pembayaran`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tagihan_id`) REFERENCES `keuangan_tagihan`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `keuangan_rekonsiliasi` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`system_amount` real NOT NULL,
	`bank_amount` real NOT NULL,
	`difference` real NOT NULL,
	`status` text NOT NULL,
	`notes` text,
	`resolved_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `keuangan_tagihan` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_number` text NOT NULL,
	`santri_id` text NOT NULL,
	`jenis_tagihan_id` text NOT NULL,
	`academic_year_id` text NOT NULL,
	`month` integer,
	`total_amount` real NOT NULL,
	`remaining_amount` real NOT NULL,
	`status` text NOT NULL,
	`due_date` text,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`santri_id`) REFERENCES `master_santri`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`jenis_tagihan_id`) REFERENCES `keuangan_master_jenis_tagihan`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`academic_year_id`) REFERENCES `master_academic_year`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `keuangan_tagihan_invoice_number_unique` ON `keuangan_tagihan` (`invoice_number`);--> statement-breakpoint
CREATE INDEX `idx_santri_tagihan` ON `keuangan_tagihan` (`santri_id`,`status`);--> statement-breakpoint
CREATE TABLE `disposisi` (
	`id` text PRIMARY KEY NOT NULL,
	`surat_id` text NOT NULL,
	`to_seksi_id` text NOT NULL,
	`note` text NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`surat_id`) REFERENCES `surats`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`to_seksi_id`) REFERENCES `master_department`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `dms_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`surat_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_url` text NOT NULL,
	`file_size` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` integer,
	`created_by` text NOT NULL,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `dms_surat_approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`surat_id` text NOT NULL,
	`required_role` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`notes` text,
	`approved_by` text,
	`approved_at` integer,
	`step_order` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` integer,
	`created_by` text NOT NULL,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `dms_surats` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`letter_number` text,
	`title` text NOT NULL,
	`sender` text NOT NULL,
	`recipient` text NOT NULL,
	`date` integer NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`template_id` text,
	`content_data` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` integer,
	`created_by` text NOT NULL,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `dms_gen` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pondok_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dms_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` integer,
	`created_by` text NOT NULL,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `surats` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`letter_number` text NOT NULL,
	`title` text NOT NULL,
	`sender` text NOT NULL,
	`recipient` text NOT NULL,
	`status` text NOT NULL,
	`period_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`period_id`) REFERENCES `periodes`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unq_letter_num_period` ON `surats` (`letter_number`,`period_id`);--> statement-breakpoint
CREATE TABLE `cash_books` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`kas_awal` real NOT NULL,
	`pemasukan_billing` real NOT NULL,
	`pemasukan_jasa` real NOT NULL,
	`pengeluaran` real NOT NULL,
	`kas_akhir` real NOT NULL,
	`period_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	FOREIGN KEY (`period_id`) REFERENCES `periodes`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `cash_deposits` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`total_pemasukan` real NOT NULL,
	`jumlah_disetor` real NOT NULL,
	`saldo_operasional` real NOT NULL,
	`keterangan` text,
	`verified_by` text,
	`period_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`period_id`) REFERENCES `periodes`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `cash_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`description` text NOT NULL,
	`period_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	FOREIGN KEY (`period_id`) REFERENCES `periodes`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `lab_computers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`ip_address` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lab_computers_name_unique` ON `lab_computers` (`name`);--> statement-breakpoint
CREATE TABLE `lab_inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lab_services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lab_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`computer_id` text NOT NULL,
	`user_id` text,
	`santri_id` text,
	`start_time` text NOT NULL,
	`end_time` text,
	`tariff_id` text NOT NULL,
	`total_cost` real DEFAULT 0,
	`status` text NOT NULL,
	FOREIGN KEY (`computer_id`) REFERENCES `lab_computers`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`santri_id`) REFERENCES `master_santri`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`tariff_id`) REFERENCES `lab_tariffs`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `lab_tariffs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price_per_hour` real NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lab_transaction_items` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`service_id` text,
	`inventory_id` text,
	`description` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` real NOT NULL,
	`subtotal` real NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `lab_transactions`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `lab_services`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`inventory_id`) REFERENCES `lab_inventory`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `lab_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_number` text NOT NULL,
	`session_id` text,
	`total_amount` real NOT NULL,
	`status` text NOT NULL,
	`payment_method` text,
	`paid_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `lab_sessions`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lab_transactions_invoice_number_unique` ON `lab_transactions` (`invoice_number`);--> statement-breakpoint
CREATE TABLE `pos_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`amount_paid` real NOT NULL,
	`payment_method` text NOT NULL,
	`timestamp` text NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `pos_transactions`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `pos_transaction_items` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`service_rate_id` text,
	`qty` integer NOT NULL,
	`price_at_sale` real NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `pos_transactions`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`service_rate_id`) REFERENCES `lab_services`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `pos_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_type` text NOT NULL,
	`billing_session_id` text,
	`total_amount` real NOT NULL,
	`status` text NOT NULL,
	`cashier_name` text,
	`period_id` text NOT NULL,
	`pondok_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`billing_session_id`) REFERENCES `lab_sessions`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`period_id`) REFERENCES `periodes`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`pondok_id`) REFERENCES `pondoks`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `kesehatan_gen` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pondok_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `humasy_gen` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pondok_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pendidikan_gen` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pondok_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media_gen` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pondok_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `musyawarah_gen` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pondok_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pembangunan_gen` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pondok_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `takmir_gen` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pondok_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bump_gen` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pondok_id` text NOT NULL
);
