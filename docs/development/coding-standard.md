# Coding Standard & Best Practices

## 1. TypeScript

- **Dilarang menggunakan `any`**. Gunakan `unknown` jika tipe benar-benar tidak diketahui, atau definisikan tipe yang spesifik.
- Gunakan `interface` untuk mendefinisikan bentuk objek (_object shape_) dan `type` untuk _union_ atau alias.
- Aktifkan strict mode di `tsconfig.json`.

## 2. React & UI (Client Components)

- Deklarasikan _Client Component_ dengan `'use client';` di baris paling atas.
- **Hoisting / Hooks Rule**: Semua fungsi yang dipanggil di dalam `useEffect` sebaiknya dideklarasikan sebelum `useEffect` (di baris atasnya) dan dibungkus dengan `useCallback` jika diperlukan sebagai dependensi, agar menghindari `react-hooks/exhaustive-deps` dan error inisialisasi.
- **Dilarang mengambil data (fetching) langsung dari komponen klien menggunakan fetch/axios**. Gunakan **Server Actions**.

## 3. Layer Architecture (Data Flow)

Aliran data wajib satu arah:
`UI (Client Component) -> Server Action -> Service -> Repository -> Database`

### Aturan Layer:

1. **Repository Layer (`.repository.ts`)**: Hanya berisi query CRUD Drizzle. Dilarang melempar error validasi atau mengecek _permission_. Mengembalikan data mentah atau _undefined_.
2. **Service Layer (`.service.ts`)**: Pusat logika bisnis. Di sinilah pengecekan **RBAC/Permission**, Validasi Zod, Pengecekan Duplikat, dan penulisan **Audit Log** dilakukan. Service akan melempar _Custom Error_ (seperti `BusinessError`, `ForbiddenError`) jika ada pelanggaran logika bisnis.
3. **Action Layer (`.action.ts`)**: Berada di lingkungan server. Memanggil fungsi Service. Menggunakan pola blok `try-catch` terpusat untuk membungkus Custom Error dari Service dan mengubahnya menjadi format balikan aman untuk klien (`{ success: false, error: "Pesan" }`).
4. **UI Layer (`*Client.tsx`)**: Menampilkan data, memanggil Action, menampilkan _Toast_ error/success berdasarkan balikan Action.

## 4. Error Handling

Dilarang menggunakan `throw new Error('Pesan standar')` di Service layer. Gunakan _Custom Exception_ yang telah dibuat agar dapat dibedakan jenis error-nya:

- `ValidationError`: Input dari user tidak valid.
- `ForbiddenError`: User tidak memiliki izin (`permission`).
- `NotFoundError`: Data tidak ditemukan.
- `ConflictError`: Data duplikat atau bentrok (contoh: NISN sudah dipakai).
- `BusinessError`: Pelanggaran aturan bisnis spesifik (contoh: "Saldo tidak mencukupi").

## 5. Kerapian Kode

- Hapus _unused imports_ dan _unused variables_.
- Jangan biarkan komentar `// TODO:` atau `// FIXME:` di branch production.
- Gunakan ESLint auto-fix sebelum _commit_.
