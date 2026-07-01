'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { mockBudgets } from '@/config/mock-data';
import { Scale, CheckCircle2, AlertTriangle, Users, BarChart3, HelpCircle, Archive, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MusyawarahDashboard() {
  const { currentUser, addNotification } = useApp();
  const [activeBudgets, setActiveBudgets] = useState(mockBudgets);
  const [votedId, setVotedId] = useState<string | null>(null);

  const isAuthorized = currentUser.permissions.includes('musyawarah.dashboard.view');

  // Find the proposal currently in "Musyawarah" state
  const proposal = activeBudgets.find(b => b.status === 'Musyawarah');

  const castVote = (voteType: 'Setuju' | 'Tolak' | 'Abstain') => {
    if (!proposal) return;

    // Simulate updating vote counts
    setActiveBudgets(prev => prev.map(b => {
      if (b.id === proposal.id && b.voting) {
        const updatedVoters = [
          ...b.voting.voters,
          { userName: currentUser.name, vote: voteType }
        ];
        const yesCount = voteType === 'Setuju' ? b.voting.yes + 1 : b.voting.yes;
        const noCount = voteType === 'Tolak' ? b.voting.no + 1 : b.voting.no;
        const abstainCount = voteType === 'Abstain' ? b.voting.abstain + 1 : b.voting.abstain;

        return {
          ...b,
          voting: {
            yes: yesCount,
            no: noCount,
            abstain: abstainCount,
            voters: updatedVoters
          }
        };
      }
      return b;
    }));

    setVotedId(proposal.id);
    addNotification(
      'Voting Musyawarah',
      `Anda memberikan suara "${voteType}" pada pengajuan anggaran seksi Keamanan.`,
      'anggaran'
    );
    alert(`Suara "${voteType}" berhasil dikirim!`);
  };

  const finalizeDecision = (decision: 'Disetujui' | 'Ditolak') => {
    if (!proposal) return;

    setActiveBudgets(prev => prev.map(b => 
      b.id === proposal.id ? { ...b, status: decision } : b
    ));

    addNotification(
      'Keputusan Musyawarah',
      `Musyawarah menyepakati pengajuan "${proposal.title}" status ${decision}.`,
      'anggaran'
    );

    alert(`Sidang selesai! Keputusan resmi: ${decision}`);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin untuk mengakses modul sidang musyawarah.
          Silakan gunakan switcher role di Header untuk berganti peran menjadi K.H. Ahmad Dahlan (Ketua Umum).
        </p>
      </div>
    );
  }

  // Voting chart data
  const chartData = proposal && proposal.voting ? [
    { name: 'Setuju', Suara: proposal.voting.yes, color: 'oklch(0.52 0.16 155)' },
    { name: 'Tolak', Suara: proposal.voting.no, color: 'oklch(0.57 0.22 25)' },
    { name: 'Abstain', Suara: proposal.voting.abstain, color: 'oklch(0.65 0.02 240)' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground">Sistem Musyawarah Dewan Harian</h1>
        <p className="text-xs text-muted-foreground">
          Pengambilan keputusan mufakat/voting atas rencana anggaran belanja (RAB) seksi dan penyusunan berita acara sidang.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Sidang Aktif Hari Ini" value={proposal ? 1 : 0} description="Musyawarah sedang berlangsung" iconName="Scale" status="primary" />
        <KPICard title="Total Suara Masuk" value={proposal?.voting?.voters.length || 0} description="Dewan Harian yang telah memilih" iconName="Users" status="success" />
        <KPICard title="Persetujuan Kuorum" value="Minimal 3 Suara" description="Batas kuorum mufakat dewan" iconName="CheckCircle2" status="info" />
        <KPICard title="Arsip Sidang" value="18 Keputusan" description="Dokumen keputusan tersimpan" iconName="Archive" status="warning" />
      </div>

      {/* Sidang Terbuka */}
      {proposal ? (
        <div className="grid gap-6 lg:grid-cols-3 text-left animate-in fade-in duration-300">
          
          {/* Deskripsi Usulan & Panel Voting */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
            <div className="flex justify-between items-center border-b border-border/30 pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase">Sidang Aktif Berjalan</span>
                <h3 className="text-sm font-extrabold text-foreground leading-tight mt-0.5">{proposal.title}</h3>
              </div>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">
                {proposal.seksi}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Deskripsi Pengajuan:</span>
                <p className="text-muted-foreground/95 leading-relaxed bg-secondary/10 p-3 rounded-lg border border-border/40">
                  {proposal.description}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Nominal Anggaran:</span>
                <span className="text-sm font-black text-foreground">Rp {proposal.amount.toLocaleString()}</span>
              </div>

              {/* Panel Tombol Voting */}
              {proposal.voting && (
                <div className="border-t border-border/20 pt-4 space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Kirimkan Suara Anda:</span>
                  
                  {votedId !== proposal.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => castVote('Setuju')}
                        className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-center text-xs shadow-sm hover:scale-[1.01] transition-all"
                      >
                        Setuju
                      </button>
                      <button
                        onClick={() => castVote('Tolak')}
                        className="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-center text-xs shadow-sm hover:scale-[1.01] transition-all"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => castVote('Abstain')}
                        className="flex-1 py-2 rounded-lg bg-slate-500 hover:bg-slate-600 text-white font-bold text-center text-xs shadow-sm hover:scale-[1.01] transition-all"
                      >
                        Abstain
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-xs text-center">
                      Terima kasih! Suara Anda telah berhasil direkam dalam sistem kuorum.
                    </div>
                  )}
                </div>
              )}

              {/* Fitur Finalisasi Rapat (Khusus Pimpinan Sidang / Ketua Umum) */}
              {currentUser.primaryRole === 'ketua_umum' && (
                <div className="border-t border-border/25 pt-4 space-y-3">
                  <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Pusat Kendali Ketua Sidang (Pimpinan Rapat)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => finalizeDecision('Disetujui')}
                      className="flex-1 py-1.5 rounded bg-primary text-primary-foreground font-bold text-center hover:bg-primary/95 transition-all shadow-sm"
                    >
                      Mufakat: Setujui Anggaran
                    </button>
                    <button
                      onClick={() => finalizeDecision('Ditolak')}
                      className="flex-1 py-1.5 rounded border border-border bg-card hover:bg-secondary text-destructive font-bold text-center transition-all"
                    >
                      Mufakat: Tolak Anggaran
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Grafik Perolehan Suara Sidang */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
            <div className="border-b border-border/30 pb-2.5">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="h-4.5 w-4.5 text-primary" />
                Hasil Perolehan Suara
              </h4>
            </div>

            <div className="h-48 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in oklch, var(--border) 40%, transparent)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="Suara" fill="oklch(0.52 0.16 155)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Riwayat Pemilih */}
            {proposal.voting && (
              <div className="border-t border-border/20 pt-3.5 space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Daftar Suara Dewan Harian:</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {proposal.voting.voters.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] p-2 bg-secondary/15 rounded">
                      <span className="font-bold text-foreground/80">{v.userName}</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ${
                        v.vote === 'Setuju' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : v.vote === 'Tolak' 
                          ? 'bg-rose-500/10 text-rose-500' 
                          : 'bg-slate-500/10 text-slate-500'
                      }`}>
                        {v.vote}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="p-8 border border-dashed border-border bg-card/50 rounded-xl text-center py-16 text-muted-foreground animate-in fade-in duration-300">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Tidak Ada Sidang Aktif</h3>
          <p className="text-[11px] text-muted-foreground mt-1">Semua usulan anggaran seksi telah selesai disidangkan dan diputuskan.</p>
        </div>
      )}
    </div>
  );
}
