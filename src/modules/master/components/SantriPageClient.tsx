'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { User, Users, FileSpreadsheet, Upload, Download, Printer, Image as ImageIcon, Check, AlertTriangle, X } from 'lucide-react';
import { SantriTable } from './SantriTable';
import { SantriForm } from './SantriForm';
import { SantriEntity } from '../types/santri.type';
import { 
  getSantris, 
  createSantri, 
  updateSantri, 
  deleteSantri, 
  importSantrisBulk, 
  getLetterhead, 
  saveLetterhead 
} from '../actions/santri.action';
import { useApp } from '@/context/AppContext';
import { PaginationMeta } from '@/components/master/StandardDataTable';
import * as xlsx from 'xlsx';

export function SantriPageClient() {
  const { showToast, pondokProfile } = useApp();
  const [santris, setSantris] = useState<SantriEntity[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<SantriEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Import states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ row: number; name: string; error: string }[]>([]);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Print & Letterhead states
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [letterhead, setLetterhead] = useState<string | null>(null);
  const [letterheadLoading, setLetterheadLoading] = useState(false);
  const letterheadInputRef = useRef<HTMLInputElement>(null);

  const fetchSantris = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    const res = await getSantris(pageNum, 20);
    if (res.success) {
      setSantris(res.data as SantriEntity[]);
      if (res.meta) setMeta(res.meta as PaginationMeta);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
  }, [showToast]);

  const fetchLetterhead = useCallback(async () => {
    const res = await getLetterhead();
    if (res.success && res.data) {
      setLetterhead(res.data as string);
    }
  }, []);

  useEffect(() => {
    fetchSantris(page);
    fetchLetterhead();
  }, [page, fetchSantris, fetchLetterhead]);

  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedSantri;
    
    const dataStr = formData.get('data') as string;
    if (dataStr) {
      const parsed = JSON.parse(dataStr);
      if (parsed.roomId === 'null' || parsed.roomId === '') parsed.roomId = null;
      if (parsed.classFormalId === 'null' || parsed.classFormalId === '') parsed.classFormalId = null;
      if (parsed.classDiniyahId === 'null' || parsed.classDiniyahId === '') parsed.classDiniyahId = null;
      formData.set('data', JSON.stringify(parsed));
    }
    
    const res = isEdit ? await updateSantri(formData) : await createSantri(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Santri berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchSantris(page);
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteSantri(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Santri berhasil dihapus', type: 'success' });
      fetchSantris(page);
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (santri: SantriEntity) => {
    setSelectedSantri(santri);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedSantri(undefined);
    setIsFormOpen(true);
  };

  // ==========================================
  // EXCEL EXPORT & TEMPLATE DOWNLOAD
  // ==========================================
  const handleExportExcel = () => {
    if (santris.length === 0) {
      showToast({ title: 'Gagal Ekspor', message: 'Tidak ada data santri untuk diekspor', type: 'error' });
      return;
    }

    const excelData = santris.map((s, idx) => ({
      'No': idx + 1,
      'NIS': s.nis || '',
      'Nama Lengkap': s.fullName || s.name || '',
      'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'NIK': s.nik || '',
      'NISN': s.nisn || '',
      'Tahun Masuk': s.entryYear || '',
      'Kamar': s.kamar?.name || '',
      'Kelas Formal': s.classFormal?.name || '',
      'Kelas Diniyah': s.classDiniyah?.name || '',
      'Status': s.statusAktif || '',
      'Tempat Lahir': s.birthPlace || '',
      'Tanggal Lahir': s.birthDate || '',
      'Jumlah Saudara': s.siblingCount || 0,
      'Anak Ke': s.childOrder || 0,
      'Agama': s.religion || '',
      'Hobi': s.hobby || '',
      'Cita-Cita': s.ambition || '',
      'Kewarganegaraan': s.nationality || '',
      'No KK': s.familyCardNumber || '',
      'Nama Ayah': s.fatherName || '',
      'No. HP Ayah': s.fatherPhone || '',
      'Nama Ibu': s.motherName || '',
      'No. HP Ibu': s.motherPhone || '',
      'Alamat/Jalan': s.addressLine1 || '',
      'Dusun': s.hamlet || '',
      'Desa/Kelurahan': s.village || '',
      'RT': s.rt || '',
      'RW': s.rw || '',
      'Kecamatan': s.district || '',
      'Kabupaten/Kota': s.city || '',
      'Provinsi': s.province || '',
      'Kode Pos': s.postalCode || ''
    }));

    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Data Santri');
    
    // Auto-fit column widths
    const maxLens = Object.keys(excelData[0] || {}).map(key => {
      let max = key.length;
      excelData.forEach(row => {
        const val = String((row as any)[key] || '');
        if (val.length > max) max = val.length;
      });
      return { wch: max + 2 };
    });
    worksheet['!cols'] = maxLens;

    xlsx.writeFile(workbook, `Data_Santri_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast({ title: 'Berhasil', message: 'Data santri berhasil diekspor ke Excel', type: 'success' });
  };

  const handleDownloadTemplate = () => {
    const templateHeaders = [
      [
        'NIS', 'Nama Lengkap', 'Jenis Kelamin (L/P)', 'NIK', 'NISN', 'Tahun Masuk',
        'Kamar (Nama)', 'Kelas Formal (Nama)', 'Kelas Diniyah (Nama)',
        'Tempat Lahir', 'Tanggal Lahir (YYYY-MM-DD)', 'Jumlah Saudara', 'Anak Ke', 'Agama',
        'Hobi', 'Cita-Cita', 'Kewarganegaraan', 'No KK',
        'NIK Ayah', 'Nama Ayah', 'Tempat Lahir Ayah', 'Tanggal Lahir Ayah (YYYY-MM-DD)',
        'Pekerjaan Utama Ayah', 'Pendidikan Terakhir Ayah', 'No HP Ayah', 'Penghasilan Ayah',
        'NIK Ibu', 'Nama Ibu', 'Tempat Lahir Ibu', 'Tanggal Lahir Ibu (YYYY-MM-DD)',
        'Pekerjaan Utama Ibu', 'Pendidikan Terakhir Ibu', 'No HP Ibu', 'Penghasilan Ibu',
        'Alamat/Jalan', 'Dusun', 'Desa/Kelurahan', 'RT', 'RW', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Kode Pos'
      ]
    ];

    const sampleRow = [
      '20260001', 'Ahmad Hidayat', 'L', '3211012345670001', '0123456789', '2026',
      'Kamar Abu Bakar', 'Kelas VII A', 'Kelas Ula A',
      'Sumedang', '2012-05-15', '2', '1', 'Islam',
      'Membaca', 'Guru', 'WNI', '3211012345670002',
      '3211012345670003', 'Suleiman', 'Sumedang', '1980-08-20',
      'Wiraswasta', 'SMA', '081234567890', '3500000',
      '3211012345670004', 'Siti Aminah', 'Sumedang', '1984-11-12',
      'Ibu Rumah Tangga', 'SMP', '081234567891', '0',
      'Jl. Raya Sumedang No. 45', 'Dusun Cempaka', 'Desa Jatihurip', '02', '04', 'Kecamatan Sumedang Utara', 'Kabupaten Sumedang', 'Jawa Barat', '45321'
    ];

    const worksheet = xlsx.utils.aoa_to_sheet([...templateHeaders, sampleRow]);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Template Santri');
    
    // Auto-fit column widths
    const maxLens = templateHeaders[0].map((header, idx) => {
      const sampleVal = String(sampleRow[idx] || '');
      const max = Math.max(header.length, sampleVal.length);
      return { wch: max + 3 };
    });
    worksheet['!cols'] = maxLens;

    xlsx.writeFile(workbook, 'Template_Import_Santri.xlsx');
    showToast({ title: 'Template Diunduh', message: 'Silakan isi data sesuai contoh pada baris kedua', type: 'success' });
  };

  // ==========================================
  // EXCEL IMPORT PROCESSING
  // ==========================================
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setFileToImport(file);

    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = xlsx.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: '' }) as any[];
          
          if (jsonData.length === 0) {
            showToast({ title: 'Berkas Kosong', message: 'Tidak ada data terdeteksi di dalam lembar Excel', type: 'error' });
            return;
          }

          // Map rows and perform basic client-side validation
          const errorsList: { row: number; name: string; error: string }[] = [];
          const mappedRows = jsonData.map((row, idx) => {
            const rowNum = idx + 2;
            const nis = String(row['NIS'] || '').trim();
            const fullName = String(row['Nama Lengkap'] || '').trim();
            const genderRaw = String(row['Jenis Kelamin (L/P)'] || '').trim().toUpperCase();
            const gender = genderRaw.startsWith('L') ? 'L' : genderRaw.startsWith('P') ? 'P' : '';
            const nik = String(row['NIK'] || '').trim();

            if (!nis) errorsList.push({ row: rowNum, name: fullName || 'Tanpa Nama', error: 'NIS wajib diisi' });
            if (!fullName) errorsList.push({ row: rowNum, name: `Baris ${rowNum}`, error: 'Nama Lengkap wajib diisi' });
            if (!gender) errorsList.push({ row: rowNum, name: fullName || `Baris ${rowNum}`, error: 'Jenis Kelamin wajib L/P' });

            const parseNumber = (val: any) => {
              if (val === '') return null;
              const n = Number(val);
              return isNaN(n) ? null : n;
            };

            return {
              nis,
              fullName,
              name: fullName,
              gender,
              nik,
              nisn: row['NISN'] ? String(row['NISN']).trim() : null,
              entryYear: row['Tahun Masuk'] ? String(row['Tahun Masuk']).trim() : null,
              roomName: row['Kamar (Nama)'] ? String(row['Kamar (Nama)']).trim() : null,
              classFormalName: row['Kelas Formal (Nama)'] ? String(row['Kelas Formal (Nama)']).trim() : null,
              classDiniyahName: row['Kelas Diniyah (Nama)'] ? String(row['Kelas Diniyah (Nama)']).trim() : null,
              birthPlace: row['Tempat Lahir'] ? String(row['Tempat Lahir']).trim() : null,
              birthDate: row['Tanggal Lahir (YYYY-MM-DD)'] ? String(row['Tanggal Lahir (YYYY-MM-DD)']).trim() : null,
              siblingCount: parseNumber(row['Jumlah Saudara']),
              childOrder: parseNumber(row['Anak Ke']),
              religion: row['Agama'] ? String(row['Agama']).trim() : 'Islam',
              hobby: row['Hobi'] ? String(row['Hobi']).trim() : null,
              ambition: row['Cita-Cita'] ? String(row['Cita-Cita']).trim() : null,
              nationality: row['Kewarganegaraan'] ? String(row['Kewarganegaraan']).trim() : 'WNI',
              familyCardNumber: row['No KK'] ? String(row['No KK']).trim() : null,
              fatherNik: row['NIK Ayah'] ? String(row['NIK Ayah']).trim() : null,
              fatherName: row['Nama Ayah'] ? String(row['Nama Ayah']).trim() : null,
              fatherBirthPlace: row['Tempat Lahir Ayah'] ? String(row['Tempat Lahir Ayah']).trim() : null,
              fatherBirthDate: row['Tanggal Lahir Ayah (YYYY-MM-DD)'] ? String(row['Tanggal Lahir Ayah (YYYY-MM-DD)']).trim() : null,
              fatherOccupation: row['Pekerjaan Utama Ayah'] ? String(row['Pekerjaan Utama Ayah']).trim() : null,
              fatherCompany: row['Instansi Pekerjaan Ayah'] ? String(row['Instansi Pekerjaan Ayah']).trim() : null,
              fatherJobAddress: row['Alamat Pekerjaan Ayah'] ? String(row['Alamat Pekerjaan Ayah']).trim() : null,
              fatherEducation: row['Pendidikan Terakhir Ayah'] ? String(row['Pendidikan Terakhir Ayah']).trim() : null,
              fatherPhone: row['No HP Ayah'] ? String(row['No HP Ayah']).trim() : null,
              fatherIncome: row['Penghasilan Ayah'] ? String(row['Penghasilan Ayah']).trim() : null,
              motherNik: row['NIK Ibu'] ? String(row['NIK Ibu']).trim() : null,
              motherName: row['Nama Ibu'] ? String(row['Nama Ibu']).trim() : null,
              motherBirthPlace: row['Tempat Lahir Ibu'] ? String(row['Tempat Lahir Ibu']).trim() : null,
              motherBirthDate: row['Tanggal Lahir Ibu (YYYY-MM-DD)'] ? String(row['Tanggal Lahir Ibu (YYYY-MM-DD)']).trim() : null,
              motherOccupation: row['Pekerjaan Utama Ibu'] ? String(row['Pekerjaan Utama Ibu']).trim() : null,
              motherCompany: row['Instansi Pekerjaan Ibu'] ? String(row['Instansi Pekerjaan Ibu']).trim() : null,
              motherJobAddress: row['Alamat Pekerjaan Ibu'] ? String(row['Alamat Pekerjaan Ibu']).trim() : null,
              motherEducation: row['Pendidikan Terakhir Ibu'] ? String(row['Pendidikan Terakhir Ibu']).trim() : null,
              motherPhone: row['No HP Ibu'] ? String(row['No HP Ibu']).trim() : null,
              motherIncome: row['Penghasilan Ibu'] ? String(row['Penghasilan Ibu']).trim() : null,
              addressLine1: row['Alamat/Jalan'] ? String(row['Alamat/Jalan']).trim() : null,
              hamlet: row['Dusun'] ? String(row['Dusun']).trim() : null,
              village: row['Desa/Kelurahan'] ? String(row['Desa/Kelurahan']).trim() : null,
              rt: row['RT'] ? String(row['RT']).trim() : null,
              rw: row['RW'] ? String(row['RW']).trim() : null,
              district: row['Kecamatan'] ? String(row['Kecamatan']).trim() : null,
              city: row['Kabupaten/Kota'] ? String(row['Kabupaten/Kota']).trim() : null,
              province: row['Provinsi'] ? String(row['Provinsi']).trim() : null,
              postalCode: row['Kode Pos'] ? String(row['Kode Pos']).trim() : null,
            };
          });

          setPreviewData(mappedRows);
          setValidationErrors(errorsList);
        } catch (evtErr: any) {
          showToast({ title: 'Pembacaan Gagal', message: 'Gagal mem-parsing berkas Excel. Cek formatnya.', type: 'error' });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      showToast({ title: 'Gagal', message: 'Gagal mengunggah file', type: 'error' });
    }
  };

  const handleImportSubmit = async () => {
    if (previewData.length === 0) return;
    
    if (validationErrors.length > 0) {
      showToast({ 
        title: 'Validasi Gagal', 
        message: `Ada ${validationErrors.length} baris bermasalah. Harap perbaiki sebelum impor.`, 
        type: 'error' 
      });
      return;
    }

    setImportLoading(true);
    const res = await importSantrisBulk(previewData);
    setImportLoading(false);

    if (res.success) {
      const report = res.data as any;
      if (report.failedCount > 0) {
        showToast({ 
          title: 'Impor Parsial', 
          message: `${report.successCount} berhasil, ${report.failedCount} gagal disimpan.`, 
          type: 'warning' 
        });
        setValidationErrors(report.errors);
      } else {
        showToast({ 
          title: 'Impor Berhasil', 
          message: `${report.successCount} data santri sukses diimpor ke database`, 
          type: 'success' 
        });
        setIsImportOpen(false);
        setPreviewData([]);
        setFileToImport(null);
        fetchSantris(page);
      }
    } else {
      showToast({ title: 'Impor Gagal', message: res.error as string, type: 'error' });
    }
  };

  const clearImportState = () => {
    setPreviewData([]);
    setValidationErrors([]);
    setFileToImport(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ==========================================
  // LETTERHEAD (KOP) MANAGEMENT & PRINTING
  // ==========================================
  const handleLetterheadUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      showToast({ title: 'Format Salah', message: 'Hanya berkas gambar (PNG/JPG) yang diperbolehkan', type: 'error' });
      return;
    }

    setLetterheadLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target?.result as string;
        const res = await saveLetterhead(base64);
        if (res.success) {
          setLetterhead(base64);
          showToast({ title: 'Kop Diperbarui', message: 'Kop surat baru berhasil diunggah dan disimpan', type: 'success' });
        } else {
          showToast({ title: 'Gagal Menyimpan', message: res.error as string, type: 'error' });
        }
        setLetterheadLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast({ title: 'Error', message: 'Gagal memproses gambar', type: 'error' });
      setLetterheadLoading(false);
    }
  };

  const handlePrintReport = () => {
    setIsPrintOpen(false);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic letterhead custom print CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
        }
      `}</style>

      <PageHeader 
        title="Master Santri"
        description="Manajemen data induk santri, penempatan kamar, dan kelas."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Pesantren' }, { label: 'Santri' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools 
              onImport={() => setIsImportOpen(true)}
              onExportExcel={handleExportExcel}
              onPrint={() => setIsPrintOpen(true)}
            />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors duration-200"
            >
              + Tambah Santri
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Santri (Aktif)" value={santris.filter(s => s.statusAktif === 'Aktif').length} icon={Users} />
        <StatisticsCard title="Santri Putra (L)" value={santris.filter(s => s.gender === 'L' && s.statusAktif === 'Aktif').length} icon={User} />
        <StatisticsCard title="Santri Putri (P)" value={santris.filter(s => s.gender === 'P' && s.statusAktif === 'Aktif').length} icon={User} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <SantriTable 
            data={santris} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)}
            meta={meta}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* ========================================================
          IMPORT EXCEL DIALOG
          ======================================================== */}
      <FormDialog 
        title="Impor Massal Santri (Excel)" 
        isOpen={isImportOpen} 
        onOpenChange={(open) => {
          setIsImportOpen(open);
          if (!open) clearImportState();
        }}
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
          {/* Step 1: Download template */}
          <div className="flex items-start gap-4 p-4 bg-muted/40 rounded-xl border">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold">1. Unduh Templat Excel asli (.xlsx)</h4>
              <p className="text-xs text-muted-foreground">Unduh templat Excel (.xlsx) resmi dengan kolom yang sesuai untuk mengisi data santri.</p>
              <button 
                onClick={handleDownloadTemplate}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all duration-200"
              >
                <Download className="h-3 w-3" /> Unduh Templat
              </button>
            </div>
          </div>

          {/* Step 2: Upload File */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold">2. Unggah File Data Santri</h4>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-muted hover:border-primary rounded-xl p-8 cursor-pointer transition-all duration-200"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-xs font-bold">Pilih berkas Excel (.xlsx)</span>
              <span className="text-[10px] text-muted-foreground mt-1">
                {fileToImport ? fileToImport.name : 'Maksimal ukuran file 10MB'}
              </span>
              <input 
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Preview Table */}
          {previewData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pratinjau Data Impor</h4>
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-black">
                  {previewData.length} data ditemukan
                </span>
              </div>

              {validationErrors.length > 0 && (
                <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-2 text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Ada kesalahan validasi data!</span> Harap perbaiki lembar Excel Anda sebelum melakukan proses impor.
                  </div>
                </div>
              )}

              <div className="border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-muted text-muted-foreground font-semibold sticky top-0">
                    <tr>
                      <th className="p-2 border-b">Row</th>
                      <th className="p-2 border-b">NIS</th>
                      <th className="p-2 border-b">Nama Lengkap</th>
                      <th className="p-2 border-b">L/P</th>
                      <th className="p-2 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, idx) => {
                      const rowNum = idx + 2;
                      const hasErr = validationErrors.some(e => e.row === rowNum);
                      return (
                        <tr key={idx} className={`hover:bg-muted/30 ${hasErr ? 'bg-destructive/5' : ''}`}>
                          <td className="p-2 border-b font-medium">{rowNum}</td>
                          <td className="p-2 border-b">{row.nis}</td>
                          <td className="p-2 border-b font-bold">{row.fullName}</td>
                          <td className="p-2 border-b">{row.gender}</td>
                          <td className="p-2 border-b">
                            {hasErr ? (
                              <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Error
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <Check className="h-3 w-3" /> Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {previewData.length > 5 && (
                  <div className="p-2 bg-muted/20 text-center text-[10px] text-muted-foreground border-t">
                    Menampilkan 5 dari {previewData.length} baris data.
                  </div>
                )}
              </div>

              {validationErrors.length > 0 && (
                <div className="space-y-1.5 max-h-24 overflow-y-auto border p-2 rounded-lg bg-card">
                  {validationErrors.map((err, idx) => (
                    <div key={idx} className="text-[10px] text-destructive flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-destructive/10 rounded font-bold">Row {err.row}</span>
                      <span className="font-semibold">{err.name}:</span>
                      <span>{err.error}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  onClick={clearImportState}
                  className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-muted transition-colors duration-200"
                >
                  Ulangi
                </button>
                <button 
                  onClick={handleImportSubmit}
                  disabled={importLoading || validationErrors.length > 0}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5"
                >
                  {importLoading ? 'Memproses Impor...' : 'Mulai Impor'}
                </button>
              </div>
            </div>
          )}
        </div>
      </FormDialog>

      {/* ========================================================
          PRINT & LETTERHEAD SETUP DIALOG
          ======================================================== */}
      <FormDialog 
        title="Cetak & Pengaturan Kop Laporan" 
        isOpen={isPrintOpen} 
        onOpenChange={setIsPrintOpen}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-primary" /> Pengaturan Kop Surat Pesantren
              </h4>
              <button 
                onClick={() => letterheadInputRef.current?.click()}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1"
              >
                <Upload className="h-3 w-3" /> Unggah Gambar Kop
              </button>
              <input 
                ref={letterheadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLetterheadUpload}
              />
            </div>
            
            {/* Letterhead Preview */}
            <div className="border rounded-xl overflow-hidden p-4 bg-muted/20 flex flex-col items-center justify-center min-h-[140px] relative">
              {letterheadLoading ? (
                <div className="text-xs text-muted-foreground">Mengunggah gambar...</div>
              ) : letterhead ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={letterhead} 
                  alt="Kop Surat" 
                  className="max-h-[120px] max-w-full object-contain animate-in fade-in duration-300" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/35 mb-2" />
                  <span className="text-xs font-bold">Kop Surat Gambar Kosong</span>
                  <span className="text-[10px] text-muted-foreground max-w-xs mt-1">
                    Silakan unggah gambar kop surat resmi pesantren. Jika tidak diunggah, kueri cetak akan menggunakan kop tulisan teks standar.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              onClick={() => setIsPrintOpen(false)}
              className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-muted transition-colors duration-200"
            >
              Batal
            </button>
            <button 
              onClick={handlePrintReport}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all duration-200 flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" /> Cetak ke PDF
            </button>
          </div>
        </div>
      </FormDialog>

      <FormDialog 
        title={selectedSantri ? 'Edit Santri' : 'Tambah Santri'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <SantriForm initialData={selectedSantri} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Santri?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus santri ini?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded-md text-sm">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-rose-500 text-white rounded-md text-sm">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PRINT TEMPLATE CONTAINER (Hidden from UI, visible in Print)
          ======================================================== */}
      <div id="print-area" className="hidden p-8 bg-white text-black font-sans">
        {/* Letterhead */}
        <div className="w-full flex justify-center items-center pb-4 border-b-4 border-black mb-6">
          {letterhead ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={letterhead} alt="Kop Surat" className="max-h-[140px] max-w-full object-contain" />
          ) : (
            <div className="text-center space-y-1">
              <h1 className="text-xl font-black uppercase tracking-wide">{pondokProfile?.name || 'Pondok Pesantren'}</h1>
              <p className="text-xs mt-1 max-w-lg mx-auto">{pondokProfile?.address || 'Alamat pesantren'}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Laporan Administrasi Resmi</p>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-lg font-black uppercase tracking-wider underline">Laporan Data Induk Santri</h2>
          <p className="text-xs font-semibold text-gray-700">Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Table Data */}
        <table className="w-full border-collapse border border-black text-xs text-left mb-8">
          <thead>
            <tr className="bg-gray-100 font-bold">
              <th className="border border-black p-2 text-center w-10">No</th>
              <th className="border border-black p-2">NIS</th>
              <th className="border border-black p-2">Nama Lengkap</th>
              <th className="border border-black p-2 text-center w-12">L/P</th>
              <th className="border border-black p-2">Kamar</th>
              <th className="border border-black p-2">Kelas</th>
              <th className="border border-black p-2 text-center w-16">Tahun Masuk</th>
            </tr>
          </thead>
          <tbody>
            {santris.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-black p-4 text-center text-gray-500">Tidak ada data santri ditemukan.</td>
              </tr>
            ) : (
              santris.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-black p-2 text-center">{idx + 1}</td>
                  <td className="border border-black p-2 font-mono">{s.nis}</td>
                  <td className="border border-black p-2 font-bold">{s.fullName || s.name}</td>
                  <td className="border border-black p-2 text-center">{s.gender}</td>
                  <td className="border border-black p-2">{s.kamar?.name || '-'}</td>
                  <td className="border border-black p-2">{s.classFormal?.name || '-'}</td>
                  <td className="border border-black p-2 text-center">{s.entryYear || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Summary Footer */}
        <div className="grid grid-cols-2 gap-4 text-xs font-bold mb-12">
          <div className="space-y-1">
            <p>Total Santri: {santris.length}</p>
            <p>Santri Putra: {santris.filter(s => s.gender === 'L').length}</p>
            <p>Santri Putri: {santris.filter(s => s.gender === 'P').length}</p>
          </div>
        </div>

        {/* Signature Area */}
        <div className="flex justify-end text-xs">
          <div className="text-center space-y-16 w-48">
            <p>Sumedang, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}<br /><strong>Sekretaris Pondok</strong></p>
            <p className="underline font-bold">Administrasi PPDS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
