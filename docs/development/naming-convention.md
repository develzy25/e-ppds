# Naming Convention

## File & Folder

- **Folder Modul**: `kebab-case` (contoh: `tahun-ajaran`, `master`).
- **File Komponen (React)**: `PascalCase.tsx` (contoh: `SantriTable.tsx`, `SantriForm.tsx`).
- **File Client Component**: `PascalCaseClient.tsx` (contoh: `SantriPageClient.tsx`).
- **File Service/Action/Repository**: `kebab-case.[type].ts` (contoh: `santri.service.ts`, `santri.action.ts`, `santri.repository.ts`).
- **File Skema Database**: `kebab-case.schema.ts` (contoh: `master.schema.ts`).
- **Tabel Database**: `snake_case` (bentuk jamak/plural jika memungkinkan, contoh: `santris`, `tahun_ajarans`).

## Variabel & Fungsi

- **Variabel & Properti Objek**: `camelCase` (contoh: `isEditMode`, `studentName`).
- **Fungsi (Hooks, Helpers)**: `camelCase` (contoh: `useApp()`, `formatCurrency()`).
- **Komponen React**: `PascalCase` (contoh: `<Button />`, `<StandardDataTable />`).
- **Tipe & Interface**: `PascalCase` (contoh: `SantriEntity`, `SantriInsert`).
- **Konstanta / Enums**: `UPPER_SNAKE_CASE` (contoh: `MAX_UPLOAD_SIZE`, `STATUS_AKTIF`).

## Database Columns

- **Primary Key**: `id` (VARCHAR/TEXT untuk cuid/uuid).
- **Foreign Key**: `[nama_tabel_tunggal]_id` (contoh: `blok_id`, `department_id`).
- **Audit Columns**: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`.

## URL & Routes

- **Path URL**: `kebab-case` (contoh: `/master/tahun-ajaran`, `/keuangan/tagihan-santri`).
