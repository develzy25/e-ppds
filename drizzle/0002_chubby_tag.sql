ALTER TABLE `background_jobs` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `background_jobs` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `background_jobs` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `background_jobs` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `background_jobs` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `backup_logs` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `backup_logs` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `backup_logs` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `backup_logs` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `backup_logs` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `backup_logs` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `document_sequences` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `document_sequences` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `document_sequences` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `document_sequences` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `document_sequences` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `document_sequences` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `files` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `files` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `files` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `files` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `files` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `master_permissions` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `master_permissions` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `master_permissions` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `master_permissions` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `master_roles` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `master_roles` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `master_roles` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `master_roles` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `notification_targets` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `notification_targets` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `notification_targets` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `notification_targets` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `notification_targets` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `notification_targets` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `periodes` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `periodes` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `periodes` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `periodes` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `pondoks` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `pondoks` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `pondoks` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `pondoks` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `schema_migrations` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `schema_migrations` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `schema_migrations` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `schema_migrations` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `schema_migrations` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `schema_migrations` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `system_audit_logs` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `system_audit_logs` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `system_audit_logs` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `system_audit_logs` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `system_audit_logs` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `system_audit_logs` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `system_events` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `system_events` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `system_events` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `system_events` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `system_events` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `system_settings` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `system_settings` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `system_settings` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `system_settings` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `system_settings` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `system_settings` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `task_assignments` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `task_assignments` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `task_assignments` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `task_assignments` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `task_assignments` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `task_assignments` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `users` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `users` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `approval_histories` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `approval_histories` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `approval_histories` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `approval_histories` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `approval_histories` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `approval_histories` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `approval_policies` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `approval_policies` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `approval_policies` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `approval_policies` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `approval_policies` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `approval_policies` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `approval_steps` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `approval_steps` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `approval_steps` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `approval_steps` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `approval_steps` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `approval_steps` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `disposisi` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `disposisi` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `disposisi` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `cash_books` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `cash_books` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `cash_books` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `cash_books` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `cash_books` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `cash_books` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `cash_deposits` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `cash_deposits` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `cash_deposits` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `cash_deposits` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `cash_deposits` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `cash_deposits` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `cash_movements` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `cash_movements` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `cash_movements` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `cash_movements` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `cash_movements` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `cash_movements` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `lab_computers` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `lab_computers` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `lab_computers` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `lab_computers` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `lab_inventory` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lab_inventory` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `lab_inventory` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `lab_inventory` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `lab_inventory` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `lab_services` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lab_services` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lab_services` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `lab_services` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `lab_services` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `lab_services` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `lab_sessions` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lab_sessions` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lab_sessions` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `lab_sessions` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `lab_sessions` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `lab_sessions` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `lab_tariffs` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lab_tariffs` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lab_tariffs` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `lab_tariffs` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `lab_tariffs` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `lab_tariffs` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `lab_transaction_items` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lab_transaction_items` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lab_transaction_items` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `lab_transaction_items` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `lab_transaction_items` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `lab_transaction_items` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `lab_transactions` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lab_transactions` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `lab_transactions` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `lab_transactions` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `lab_transactions` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `pos_payments` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `pos_payments` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `pos_payments` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `pos_payments` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `pos_payments` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `pos_payments` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `pos_transaction_items` ADD `created_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `pos_transaction_items` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `pos_transaction_items` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `pos_transaction_items` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `pos_transaction_items` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `pos_transaction_items` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `pos_transactions` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `pos_transactions` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `pos_transactions` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `pos_transactions` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `pos_transactions` ADD `deleted_by` text;