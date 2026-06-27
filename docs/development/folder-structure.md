# Folder Structure & Module Architecture

Proyek ini mengadopsi **Module-First Architecture** dengan **Domain-Driven Design (DDD)** yang diadaptasi untuk Next.js.

## Hirarki Direktori Utama

```text
src/
├── app/                  # Next.js App Router (Hanya mengatur routing & UI murni)
│   ├── (auth)/           # Route group untuk Login/Register
│   ├── master/           # Route group modul Master
│   └── keuangan/         # Route group modul Keuangan
├── components/           # Shared Components (UI global, Shadcn, generic layout)
│   ├── ui/               # Komponen atomik (Button, Input, dll)
│   └── master/           # Komponen reusable spesifik (misal: PageHeader, FormDialog)
├── config/               # Konfigurasi global (Env, site metadata, dll)
├── context/              # React Context Providers (AppContext, AuthContext)
├── db/                   # Konfigurasi koneksi Database (Drizzle client)
├── lib/                  # Utility functions murni (formatter, middleware helpers)
└── modules/              # ⭐️ Core Domain Logic (Pemisahan per domain bisnis)
    ├── master/
    ├── keuangan/
    └── dms/
```

## Struktur Di Dalam Sebuah Modul

Setiap modul di dalam `src/modules/[nama-modul]/` **WAJIB** memiliki struktur terisolasi berikut:

```text
src/modules/master/santri/
├── actions/              # Server Actions (Penghubung UI Client ke Service Server)
│   └── santri.action.ts
├── components/           # Komponen UI spesifik untuk modul/entitas ini
│   ├── SantriForm.tsx
│   ├── SantriTable.tsx
│   └── SantriPageClient.tsx
├── hooks/                # Custom React Hooks (opsional)
├── repositories/         # Akses Database Murni (Drizzle Queries, tidak ada logika bisnis)
│   └── santri.repository.ts
├── schemas/              # Drizzle ORM Schema
│   └── santri.schema.ts
├── services/             # ⭐️ Business Logic (Validasi, Error, Audit Log, Workflow)
│   └── santri.service.ts
├── types/                # TypeScript Interfaces/Types & Zod Validation Schemas
│   └── santri.type.ts
└── validators/           # Zod Validators (Schema input dari form/API)
    └── santri.validator.ts
```

## Aturan Ketat (Strict Rules)

1. **Dilarang keras** melakukan _query database_ (Drizzle) langsung dari dalam komponen UI atau Server Actions. Akses DB **hanya boleh** dilakukan melalui layer **Repository**.
2. **Server Action** tidak boleh memuat _Business Logic_. Action hanya memanggil fungsi dari **Service**, menangkap error, dan mengembalikan status UI (`{ success: true, data: ... }`).
3. **Pemisahan Modul**: Modul Keuangan tidak boleh mengimpor langsung dari `src/modules/master/santri/repositories`. Interaksi antar modul harus melalui layer **Service** dari modul tujuan (contoh: `SantriService.getSantriAktif()`).
