# PROJECT BLUEPRINT PPDS ERP

> **Dokumen ini adalah pedoman visi dan arsitektur tingkat tinggi (High-Level) pengembangan PPDS ERP.**
>
> Detail teknis implementasi berada di folder `docs/`.

## 1. Visi & Filosofi

PPDS bukan sekadar aplikasi administrasi, tetapi sebuah **Enterprise Resource Planning (ERP)**.

- **Single Source of Truth**: Semua data bersumber dari satu tempat (Master Data). Tidak ada duplikasi entitas.
- **Module-First Architecture**: Aplikasi dibagi berdasarkan domain bisnis (modul).
- **Domain-Driven Design**: Logika bisnis dikapsulasi di tingkat Service masing-masing modul.

## 2. Konsep ERP

```
Authentication
        │
        ▼
Authorization (RBAC)
        │
        ▼
Master Data
        │
        ▼
Financial Engine
        │
        ▼
Seluruh Modul Pondok
```

## 3. Arsitektur Utama

- Framework: Next.js (Strict Module-First)
- Database: Drizzle ORM dengan schema terpisah per modul.
- Security: RBAC (`module.resource.action`).

## 4. Roadmap Singkat

1. **Sprint 1**: Foundation
2. **Sprint 2**: Core Master Data
3. **Sprint 3**: Financial Engine
4. **Sprint 4+**: Modul Operasional (BUMP, Laboratorium, Pendidikan, dll)

_(Detail lengkap dapat dilihat di `ROADMAP.md`)_

## 5. Struktur Dokumentasi

Detail implementasi dipisahkan pada dokumen berikut:

- **[Architecture](docs/architecture/)**: Panduan layer aplikasi, rbac, audit log, dll.
- **[Modules](docs/modules/)**: Aturan bisnis, workflow, dan cakupan setiap modul.
- **[Database](docs/database/)**: ERD, schema, dan relasi.
- **[UI](docs/ui/)**: Komponen, layout, form, dan tema.
- **[API](docs/api/)**: Server Actions, Repositories, Services.
- **[Development](docs/development/)**: Standar folder, penamaan, dan testing.
