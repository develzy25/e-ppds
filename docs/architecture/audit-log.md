# Audit Log & Activity Timeline Convention

## Konsep Audit Log

Setiap perubahan data (Insert, Update, Delete, Restore, Approve) di ERP **wajib** dicatat dalam sebuah tabel log terpusat: `system_audit_logs`.

Hal ini penting untuk:

- Melacak siapa yang mengubah data dan kapan.
- Kepatuhan (Compliance) terhadap standar transparansi.
- Kebutuhan _debugging_ dan penelusuran sejarah (Activity Timeline).

## Skema `system_audit_logs`

Tabel ini akan menyimpan riwayat perubahan secara polimorfik (satu tabel untuk mencatat seluruh entitas).

| Kolom        | Tipe     | Penjelasan                                         |
| ------------ | -------- | -------------------------------------------------- |
| `id`         | String   | ID unik log                                        |
| `module`     | String   | Nama modul (contoh: `keuangan`, `master`)          |
| `entityName` | String   | Nama entitas/tabel (contoh: `santris`, `invoices`) |
| `entityId`   | String   | ID dari baris data yang diubah                     |
| `action`     | String   | `CREATE`, `UPDATE`, `DELETE`, `RESTORE`, `APPROVE` |
| `oldValues`  | JSON     | Kondisi data _sebelum_ diubah (kosong jika CREATE) |
| `newValues`  | JSON     | Kondisi data _setelah_ diubah (kosong jika DELETE) |
| `userId`     | String   | ID pengguna yang melakukan aksi                    |
| `ipAddress`  | String   | Alamat IP pengguna                                 |
| `userAgent`  | String   | Perangkat/Browser pengguna                         |
| `createdAt`  | DateTime | Waktu log dicatat                                  |

## Aturan Penulisan Log

Pencatatan log **HANYA** boleh dilakukan di **Service Layer**, segera setelah operasi database berhasil.

Contoh Implementasi:

```typescript
import { insertAuditLog } from "@/modules/core/services/audit.service";

export async function updateSantri(id: string, newData: SantriUpdate) {
  const oldData = await santriRepo.findById(id);

  // Proses update di DB
  await santriRepo.update(id, newData);

  // Catat Audit Log
  await insertAuditLog({
    module: "master",
    entityName: "santris",
    entityId: id,
    action: "UPDATE",
    oldValues: oldData,
    newValues: newData,
    userId: currentUser.id,
  });
}
```

## Activity Timeline

Data dari `system_audit_logs` akan ditampilkan pada halaman detail masing-masing entitas (contoh: Detail Santri) sebagai "Activity Timeline" yang menampilkan riwayat interaksi pengguna dengan data tersebut secara kronologis.
