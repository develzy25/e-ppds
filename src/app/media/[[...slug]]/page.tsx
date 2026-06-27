'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { mockMediaDocs } from '@/config/mock-data';
import { Image as ImageIcon, UploadCloud, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const slugToTab = (slugStr?: string): 'dokumentasi' | 'publikasi' | 'jaringan' => {
  if (!slugStr) return 'dokumentasi';
  switch (slugStr) {
    case 'dokumentasi': return 'dokumentasi';
    case 'publikasi': return 'publikasi';
    case 'inventaris':
    case 'jaringan':
      return 'jaringan';
    default: return 'dokumentasi';
  }
};

const tabToSlug = (tab: 'dokumentasi' | 'publikasi' | 'jaringan') => {
  switch (tab) {
    case 'dokumentasi': return 'dokumentasi';
    case 'publikasi': return 'publikasi';
    case 'jaringan': return 'jaringan';
  }
};

export default function MediaDashboard() {
  const { currentUser, addNotification } = useApp();
  const [mediaDocs, setMediaDocs] = useState(mockMediaDocs);
  
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] | undefined;
  
  // Set active tab based on path slug
  const activeTab = slugToTab(slug?.[0]);

  // Upload Form Simulation State
  const [albumTitle, setAlbumTitle] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<{ name: string; sizeMb: number }[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const isAuthorized = currentUser.permissions.includes('media_dashboard_view');

  const addPhotoSimulate = () => {
    setErrorMsg('');
    setUploadSuccess(false);

    // Limit check: Max 5 photos
    if (selectedPhotos.length >= 5) {
      setErrorMsg('⚠️ Batas maksimal adalah 5 foto per album kegiatan!');
      return;
    }

    // Simulate adding a photo. Generate random size between 2MB and 12MB to test limit
    const randomSize = parseFloat((Math.random() * 10 + 2).toFixed(1)); // 2MB to 12MB
    const photoIndex = selectedPhotos.length + 1;
    const newPhoto = {
      name: `Khataman_0${photoIndex}.jpg`,
      sizeMb: randomSize
    };

    // Size limit check: Max 10MB per photo
    if (randomSize > 10) {
      setErrorMsg(`⚠️ Gagal unggah ${newPhoto.name}! Ukuran file (${randomSize} MB) melampaui batas maksimal 10 MB per foto.`);
      return;
    }

    setSelectedPhotos(prev => [...prev, newPhoto]);
  };

  const publishAlbum = () => {
    if (!albumTitle) {
      setErrorMsg('⚠️ Judul kegiatan harus diisi!');
      return;
    }
    if (selectedPhotos.length === 0) {
      setErrorMsg('⚠️ Minimal harus mengunggah 1 foto!');
      return;
    }

    const newAlbum = {
      id: `med-${Date.now()}`,
      activityTitle: albumTitle,
      uploadedBy: currentUser.name,
      uploadedAt: 'Hari ini, Baru saja',
      photos: selectedPhotos.map(p => ({ url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80', sizeMb: p.sizeMb })),
      status: 'Published' as const,
      publishedAt: 'Baru saja'
    };

    setMediaDocs(prev => [newAlbum, ...prev]);
    addNotification(
      'Dokumentasi Dipublikasi',
      `Album kegiatan "${albumTitle}" berhasil diunggah dengan ${selectedPhotos.length} foto.`,
      'umum'
    );

    setUploadSuccess(true);
    setAlbumTitle('');
    setSelectedPhotos([]);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul media.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi Ust. M. Ali (Kasie Lab yang merangkap Anggota Media).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground">Media & Dokumentasi</h1>
        <p className="text-xs text-muted-foreground">
          Pusat publikasi galeri kegiatan pondok pesantren, manajemen website utama, jaringan internet, dan inventaris kamera.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Dokumentasi Terbit" value={mediaDocs.length} description="Album kegiatan dipublikasi" iconName="Camera" status="primary" />
        <KPICard title="Draf Berita Website" value="2 Post" description="Berita menanti ulasan Sekretaris" iconName="FileText" status="warning" />
        <KPICard title="Inventaris Kamera" value="4 Aset" description="Kamera, Tripod, Mic Wireless" iconName="Camera" status="success" />
        <KPICard title="Status Jaringan" value="100 Mbps" description="Bandwidth internet utama lab/kantor" iconName="Monitor" status="info" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-2">
        <button onClick={() => router.replace('/media/dokumentasi')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'dokumentasi' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Dokumentasi Kegiatan
        </button>
        <button onClick={() => router.replace('/media/publikasi')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'publikasi' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Publikasi Website & Sosmed
        </button>
        <button onClick={() => router.replace('/media/jaringan')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'jaringan' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Internet & Jaringan
        </button>
      </div>

      {/* Content */}
      <div className="text-left">
        {activeTab === 'dokumentasi' && (
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Form Upload & Validasi (col-span-1) */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
              <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                <UploadCloud className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Unggah Dokumentasi Kegiatan</h4>
              </div>

              <div className="space-y-4 text-xs">
                {/* Judul Kegiatan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Nama / Judul Kegiatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rapat Pleno Syawal"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2 font-bold text-foreground focus:outline-none"
                  />
                </div>

                {/* Simulasi Unggah Foto */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                    <span>Daftar File ({selectedPhotos.length}/5)</span>
                    <span className="text-primary">Maks 10MB/foto</span>
                  </div>

                  <button
                    onClick={addPhotoSimulate}
                    className="w-full py-2 border border-dashed border-border/80 hover:border-primary/40 rounded-lg text-center flex items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-all bg-secondary/10"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Simulasi Unggah Foto (Random Size)</span>
                  </button>

                  {/* List Foto Diunggah */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {selectedPhotos.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-secondary/20">
                        <span className="truncate max-w-[150px] font-mono">{p.name}</span>
                        <span className="font-semibold text-foreground/80">{p.sizeMb} MB</span>
                      </div>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded bg-rose-500/10 text-rose-500 font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-2.5 rounded bg-emerald-500/10 text-emerald-500 font-bold flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Album berhasil diterbitkan!</span>
                  </div>
                )}

                <button
                  onClick={publishAlbum}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md hover:scale-101 transition-all"
                >
                  Publikasikan Album Kegiatan
                </button>
              </div>
            </div>

            {/* Repositori Galeri (col-span-2) */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
              <div className="border-b border-border/20 pb-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Repositori Galeri Terbit</h4>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {mediaDocs.map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-xl border border-border bg-secondary/15 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-foreground text-xs leading-snug">{doc.activityTitle}</div>
                      <p className="text-[10px] text-muted-foreground">Diunggah oleh: {doc.uploadedBy}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {doc.photos.map((p, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-slate-900 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt="pic" className="absolute inset-0 h-full w-full object-cover opacity-60" />
                          <span className="z-10 text-[9px] font-bold text-white bg-black/60 px-1 py-0.5 rounded font-mono">
                            {p.sizeMb} MB
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-muted-foreground border-t border-border/20 pt-2">
                      <span>{doc.uploadedAt}</span>
                      <span className="font-bold text-emerald-500 uppercase tracking-wider">{doc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'publikasi' && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass text-xs space-y-4 max-w-2xl">
            <div>
              <h4 className="font-bold text-foreground uppercase tracking-wider">Draf Postingan Buletin & Website</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Sekretariat mempublikasikan artikel kegiatan di website resmi PPDS.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-secondary/15 text-center py-8 text-muted-foreground">
              Simulasi: Repositori artikel kosong. Semua berita bulan berjalan telah diterbitkan.
            </div>
          </div>
        )}

        {activeTab === 'jaringan' && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass text-xs space-y-4 max-w-2xl">
            <div>
              <h4 className="font-bold text-foreground uppercase tracking-wider">Status Koneksi Internet & Jaringan Router</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Monitoring bandwith server mikrotik utama dan akses router internet lab.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-secondary/15 text-center py-8 text-emerald-500 font-bold flex items-center justify-center gap-1.5">
              <CheckCircle className="h-4.5 w-4.5" />
              Jaringan router ISP IndiHome utama menyambung (Connected) - Ping 15ms.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
