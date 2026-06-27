# Role-Based Access Control (RBAC) murni berbasis Permission

Sistem PPDS ERP **TIDAK** mengecek akses berdasarkan nama Role (seperti `if (user.role === 'Admin')`).
Pengecekan akses mutlak dilakukan menggunakan **Permission** (contoh: `if (user.permissions.includes('master.santri.create'))`).

## Keuntungan

- **Fleksibilitas Tinggi**: Role dapat diubah atau ditambah kapan saja oleh Administrator tanpa perlu mengubah _source code_.
- **Granularitas**: Izin dapat diberikan secara sangat spesifik (misal: hanya bisa mencetak struk, tapi tidak bisa menghapus).

## Format String Permission

Pola penamaan permission: `[modul].[resource].[action]`
Contoh:

- `master.santri.view`
- `master.santri.create`
- `keuangan.invoice.approve`
- `dms.surat.print`

## Implementasi di Code

### Di Service Layer (Server)

Service Layer adalah palang pintu utama keamanan data.

```typescript
import { requirePermission } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/auth";

export async function createSantri(data: SantriInsert) {
  const user = await getCurrentUser();
  requirePermission(user, "master.santri.create"); // Akan throw ForbiddenError jika gagal

  // Lanjutkan proses simpan...
}
```

### Di UI Layer (Client)

Digunakan untuk menyembunyikan tombol atau rute.

```typescript
import { useApp } from '@/context/AppContext';

export function SantriTable() {
  const { currentUser } = useApp();
  const canDelete = currentUser.permissions.includes('master.santri.delete');

  return (
    <div>
      {canDelete && <button>Hapus</button>}
    </div>
  );
}
```
