# Database & Soft Delete Convention

## 1. Drizzle ORM

Seluruh interaksi database wajib menggunakan **Drizzle ORM** dengan koneksi ke **Cloudflare D1** (SQLite).

## 2. Standard Tabel & Soft Delete

Semua tabel entitas utama **DIWAJIBKAN** memiliki 7 kolom standar berikut:

```typescript
import { text, integer } from "drizzle-orm/sqlite-core";

// Di dalam skema:
id: text("id").primaryKey(),
createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
deletedAt: integer("deleted_at", { mode: "timestamp" }),
createdBy: text("created_by").notNull(),
updatedBy: text("updated_by"),
deletedBy: text("deleted_by"),
```

### Aturan Soft Delete

1. **Dilarang menggunakan DELETE SQL langsung** (hard delete) pada tabel entitas operasional (Santri, Surat, Invoice, dll).
2. Ketika menghapus data, kita melakukan **UPDATE** pada field `deletedAt` dengan waktu saat ini, dan `deletedBy` dengan ID pengguna yang menghapus.
3. Pada layer Repository, setiap query `select` **WAJIB** menyertakan kondisi `isNull(table.deletedAt)` untuk memastikan data yang "terhapus" tidak muncul.

## 3. Isolasi Skema Modul

Dilarang membuat satu file skema raksasa (`drizzle-schema.ts`).
Skema harus dipecah per modul.

- `src/modules/master/schemas/master.schema.ts`
- `src/modules/keuangan/schemas/keuangan.schema.ts`

Relasi lintas modul dilakukan dengan merujuk ke tabel lain. Drizzle mendukung relasi antar file selama nama tabel sama.

## 4. Penamaan Tabel

- Harus menggunakan bahasa Inggris yang dijamakkan (contoh: `santris`, `invoices`) atau bahasa Indonesia yang dijamakkan (contoh: `surats`, `tagihans`) sesuai kesepakatan tim, tetapi direkomendasikan `snake_case` (contoh: `system_audit_logs`).
