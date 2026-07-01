import { getSuratsAction } from '@/modules/dms/actions/dms.action';
import { dmsSurats } from '@/modules/dms/schemas/dms.schema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function DaftarSuratPage() {
  const response = await getSuratsAction();
  const surats: (typeof dmsSurats.$inferSelect)[] = response.success && response.data ? response.data : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daftar Surat</h1>
          <p className="text-muted-foreground">Kelola semua surat masuk dan keluar.</p>
        </div>
        <Link href="/dms/surat/buat">
          <Button>Buat Surat Baru</Button>
        </Link>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor Surat</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead>Tujuan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Belum ada surat.
                </TableCell>
              </TableRow>
            ) : (
              surats.map((surat) => (
                <TableRow key={surat.id}>
                  <TableCell className="font-medium">{surat.letterNumber || '-'}</TableCell>
                  <TableCell>{surat.title}</TableCell>
                  <TableCell>{surat.recipient}</TableCell>
                  <TableCell>{format(new Date(surat.date), 'dd MMM yyyy', { locale: id })}</TableCell>
                  <TableCell>
                    <Badge variant={surat.status === 'APPROVED' ? 'default' : 'secondary'}>
                      {surat.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dms/surat/${surat.id}`}>
                      <Button variant="ghost" size="sm">Detail & Print</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
