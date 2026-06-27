import { db } from '@/db';
import { dmsSurats } from '@/modules/dms/schemas/dms.schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { PrintButton } from '@/modules/dms/components/PrintButton';

export default async function DetailSuratPage({ params }: { params: { id: string } }) {
  const [surat] = await db.select().from(dmsSurats).where(eq(dmsSurats.id, params.id)).limit(1);

  if (!surat) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detail Surat</h1>
          <p className="text-muted-foreground">{surat.title}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dms/surat">
            <Button variant="outline">Kembali</Button>
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Kertas Surat / WYSWYG Print Layout */}
      <div className="bg-white text-black p-10 min-h-[1000px] border shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Kop Surat Header (Mockup) */}
        <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-widest">Pondok Pesantren Darussalam Sumedang</h1>
          <p className="text-sm">Jl. Pesantren No.1, Sindang, Sumedang - Jawa Barat</p>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <p>Nomor: {surat.letterNumber || '......................'}</p>
            <p>Perihal: {surat.title}</p>
          </div>
          <div>
            <p>Tanggal: {new Date(surat.date).toLocaleDateString('id-ID')}</p>
            <p>Kepada Yth. <strong>{surat.recipient}</strong></p>
          </div>
        </div>

        {/* Isi Surat (Render HTML dari TipTap / DB) */}
        <div 
          className="prose prose-sm max-w-none text-black" 
          dangerouslySetInnerHTML={{ __html: surat.contentData || '' }}
        />

        {/* Footer / Tanda Tangan */}
        <div className="mt-24 flex justify-end">
          <div className="text-center">
            <p className="mb-4">Hormat Kami,</p>
            <p className="mb-2"><strong>{surat.sender}</strong></p>
            {/* Digital Signature QR Code Mockup */}
            {surat.status === 'APPROVED' ? (
              <div className="flex justify-center my-2">
                <QRCode value={`https://ppds.app/verify/${surat.id}`} size={80} />
              </div>
            ) : (
              <div className="h-[80px] flex items-center justify-center text-xs text-gray-400 italic border border-dashed mb-2">
                Menunggu TTD
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">{surat.status === 'APPROVED' ? 'Tanda Tangan Elektronik Valid' : 'Belum Ditandatangani'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
