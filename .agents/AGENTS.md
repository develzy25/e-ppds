# AI Development Instructions

## PPDS ERP (Pondok Pesantren Darussalam Sumedang)

> **WAJIB DIBACA SEBELUM MELAKUKAN PERUBAHAN KODE.**
>
> Dokumen ini berisi aturan teknis yang harus dipatuhi oleh seluruh AI Agent maupun developer yang berkontribusi pada proyek PPDS ERP.

---

# 1. Tujuan Pengembangan

PPDS adalah sebuah **Enterprise Resource Planning (ERP)** untuk Pondok Pesantren. Semua modul harus saling terintegrasi. Jangan pernah membangun modul sebagai aplikasi yang berdiri sendiri.

# 2. Single Source of Truth

Jangan membuat data master yang sama di dua tempat. Semua modul wajib mengambil data dari **Master Data**.

# 3. Module-First Architecture

WAJIB menggunakan struktur berikut: `src/modules/[nama_modul]/`
Business Logic tidak boleh berada di `page.tsx`, `layout.tsx`, atau component UI.

# 4. Struktur Module

Setiap module WAJIB memiliki: `actions/`, `components/`, `hooks/`, `repositories/`, `schemas/`, `services/`, `types/`, `validators/`.
Jangan membuat struktur baru tanpa alasan kuat.

# 5. Layer Architecture

`UI -> Server Action -> Service -> Repository -> Database`

- **Repository**: Hanya CRUD Database, Query, Transaction. Tidak boleh validasi bisnis.
- **Service**: Semua Business Logic (Validasi, Permission, Duplicate Checking, Audit Log, Workflow).
- **UI**: Hanya menampilkan data & mengirim request.

# 6. Database

Gunakan Drizzle ORM. Schema dipisahkan berdasarkan module (contoh: `modules/keuangan/schemas/`). Jangan membuat schema monolitik.

# 7. Standar Tabel

Semua tabel wajib memiliki: `id`, `createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy`. Gunakan Soft Delete.

# 8. Audit Log

Seluruh perubahan wajib dicatat di `system_audit_logs`. Action minimal: CREATE, UPDATE, DELETE, RESTORE, LOGIN, LOGOUT, APPROVE, REJECT, IMPORT, EXPORT.

# 9. Permission

Gunakan format `module.resource.action` (contoh: `master.santri.create`). Jangan mengecek role secara langsung, selalu gunakan `requirePermission(...)`.

# 10. Shared Components

Gunakan komponen reusable di `src/components/master`. Jangan menduplikasi `StandardDataTable`, `FormDialog`, `ConfirmDelete`, dll.

# 11. Error Handling

Gunakan exception khusus: `BusinessError`, `ValidationError`, `ForbiddenError`, `NotFoundError`, `ConflictError`. Dilarang menggunakan `throw new Error(...)`.

# 12. Coding Standard

- Strict TypeScript (Dilarang `any`).
- Tidak ada dead code, TODO, atau FIXME.
- Tidak ada hardcoded role/permission.

**Jika terdapat keraguan terhadap implementasi, prioritaskan konsistensi arsitektur dibandingkan solusi cepat yang berpotensi menimbulkan refactor besar di masa mendatang.**
