'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createDraftSuratAction } from '@/modules/dms/actions/dms.action';
import { toast } from 'sonner';

export default function BuatSuratPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    sender: 'Sekretariat PPDS',
    recipient: '',
    contentData: '<p>Tulis isi surat di sini...</p>',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await createDraftSuratAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success('Draft Surat berhasil dibuat!');
      router.push('/dms/surat'); // Redirect to list
    } else {
      toast.error('Gagal membuat surat: ' + res.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buat Surat Baru</h1>
        <p className="text-muted-foreground">Draft surat menggunakan editor teks kaya (Rich Text Editor).</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Perihal / Judul Surat</Label>
            <Input 
              id="title" 
              placeholder="e.g. Surat Pemberitahuan Libur" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient">Tujuan / Kepada Yth.</Label>
            <Input 
              id="recipient" 
              placeholder="e.g. Wali Santri Kelas 10" 
              value={formData.recipient}
              onChange={e => setFormData({ ...formData, recipient: e.target.value })}
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sender">Pengirim</Label>
          <Input 
            id="sender" 
            value={formData.sender}
            onChange={e => setFormData({ ...formData, sender: e.target.value })}
            required 
          />
        </div>

        <div className="space-y-2">
          <Label>Isi Surat</Label>
          <RichTextEditor 
            content={formData.contentData} 
            onChange={html => setFormData({ ...formData, contentData: html })} 
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan sebagai Draft'}
          </Button>
        </div>
      </form>
    </div>
  );
}
