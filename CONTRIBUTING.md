# Panduan Kontribusi PPDS ERP

## 1. Branch Strategy

- `main`: Production-ready code.
- `staging`: Pre-production testing.
- `feature/*`: Untuk pengembangan fitur baru.
- `fix/*`: Untuk perbaikan bug.

## 2. Commit Convention

Gunakan Conventional Commits:

- `feat:` Fitur baru
- `fix:` Perbaikan bug
- `docs:` Perubahan dokumentasi
- `refactor:` Perubahan struktur kode tanpa menambah fitur
- `chore:` Maintenance, deps update

## 3. Coding Standard

- Gunakan Strict TypeScript. Dilarang menggunakan `any`.
- Ikuti prinsip Module-First Architecture.
- Referensi lengkap: [docs/architecture/coding-standard.md](docs/architecture/coding-standard.md)

## 4. Pull Request Checklist

- [ ] Lulus `npm run lint` (0 errors, 0 warnings)
- [ ] Lulus `npm run build`
- [ ] Menambahkan Audit Log pada operasi CRUD baru
- [ ] Menambahkan Permission checking pada fungsi baru
- [ ] Menggunakan Soft Delete untuk tabel baru

## 5. Build Checklist

Pastikan aplikasi aman sebelum di-deploy:

```bash
npm run lint && npm run build
```
