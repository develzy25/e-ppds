# Document Management System (DMS)

### PPDS ERP

> Seluruh surat, dokumen, formulir, SK, sertifikat, pengumuman, dan administrasi pondok dibuat langsung dari PPDS ERP tanpa menggunakan Microsoft Word.

---

## Tujuan

PPDS ERP memiliki **Office Editor** bawaan sehingga seluruh administrasi pondok dilakukan langsung melalui website.

Pengguna cukup:

- Membuat dokumen
- Menyimpan Draft
- Mengajukan Approval
- Mencetak
- Mengekspor PDF
- Mengekspor DOCX
- Mengarsipkan

Tidak perlu lagi membuat surat menggunakan Microsoft Word.

---

## Konsep

````text
Template Surat
        │
        ▼
Office Editor
        │
        ▼
Auto Fill Data ERP
        │
        ▼
Preview
        │
        ▼
Approval
        │
        ▼
Nomor Surat
        │
        ▼
Digital Signature
        │
        ▼
Print / PDF / DOCX
        │
        ▼
Arsip Digital
```text

---

## Modul Pengguna

Seluruh bagian administrasi dapat membuat surat sendiri.

### Kesekretariatan

* Surat Masuk
* Surat Keluar
* SK
* Disposisi
* Memo
* Pengumuman

---

### Bendahara

* LPJ
* Nota
* Kwitansi
* Surat Pengajuan Dana

---

### Keuangan

* Invoice
* Kwitansi
* Bukti Pembayaran
* Tagihan

---

### Pendidikan

* Surat Keterangan
* Rapor
* Sertifikat
* Transkrip
* Jadwal

---

### Keamanan

* Surat Izin
* Surat Pelanggaran
* SKKB
* Surat Pemanggilan

---

### Kesehatan

* Surat Rujukan
* Surat Keterangan Sakit
* Resep

---

### Ketua Blok

* Surat Rekomendasi
* Surat Izin

---

### Takmir

* Surat Tugas Imam
* Surat Kegiatan

---

### Pembangunan

* SPK
* Berita Acara
* Progress Report

---

### Media

* Surat Permohonan Liputan

---

### Humasy

* Surat Tamu
* Surat Kerja Sama

---

### Jam'iyyah

* Surat Undangan
* Berita Acara

---

### Musyawarah

* Notulen
* Berita Acara
* Hasil Keputusan

---

## Office Editor

Editor harus menyerupai Microsoft Word.

Mendukung:

### Font

* Font Family
* Font Size
* Bold
* Italic
* Underline
* Strike
* Highlight

---

### Paragraph

* Align Left

* Align Right

* Center

* Justify

* Indent

* Hanging Indent

* Line Spacing

* Paragraph Spacing

---

### Page

* A4
* F4
* Letter
* Legal

Portrait

Landscape

Margin:

* Top
* Bottom
* Left
* Right

---

### Header Footer

* Header
* Footer
* Nomor Halaman
* Logo Pondok

---

### Table

* Insert Table
* Merge Cell
* Split Cell
* Border
* Background

---

### Image

* Upload
* Resize
* Crop
* Rotate
* Wrap Text

---

### Shape

* Rectangle
* Circle
* Line

---

### Watermark

* Logo
* Draft
* Confidential

---

### List

* Numbering

* Bullet

* Multi Level List

---

### Tab Stop

Sama seperti Microsoft Word.

---

### Columns

* 1
* 2
* 3
* Custom

---

### Section Break

Harus didukung.

---

### Page Break

Harus didukung.

---

### Cover Page

Harus didukung.

---

## Dynamic Variable

Editor harus dapat mengambil data ERP secara otomatis.

Contoh:

```text
{{santri.nama}}

{{santri.nis}}

{{santri.kelas}}

{{santri.kamar}}

{{pengurus.nama}}

{{tanggal}}

{{nomor_surat}}

{{tahun_ajaran}}
```text

Ketika surat dicetak, seluruh variabel otomatis diganti dengan data sebenarnya.

---

## Template Surat

Admin dapat membuat template.

Contoh:

* Surat Aktif Santri
* Surat Keluar
* Surat Tugas
* Surat Izin
* Sertifikat
* Piagam
* Kwitansi
* Invoice

Template dapat digunakan berulang kali.

---

## Penomoran Surat

Nomor surat dibuat otomatis.

Contoh:

```text
001/PPDS/SK/VII/2026

002/PPDS/UND/VII/2026
```text

Format dapat diatur.

---

## Approval Workflow

Draft

↓

Review

↓

Revisi

↓

Disetujui

↓

Tanda Tangan

↓

Arsip

↓

Print

---

## Digital Signature

Mendukung:

* QR Code
* Tanda tangan digital
* Scan tanda tangan
* Sertifikat elektronik (opsional)

---

## Export

Dokumen dapat diekspor menjadi:

* PDF
* DOCX
* HTML

---

## Print

Print harus mempertahankan layout 100%.

Tidak boleh berubah dari tampilan editor.

---

## Versioning

Setiap perubahan dokumen disimpan.

Dapat melihat:

* Version 1
* Version 2
* Version 3

dan melakukan Restore.

---

## Audit Log

Seluruh aktivitas dicatat.

* Dibuat
* Diubah
* Direview
* Disetujui
* Dicetak
* Diunduh
* Dihapus
* Dipulihkan

---

## Hak Akses

Permission menggunakan standar:

```text
dokumen.template.view

dokumen.template.create

dokumen.template.update

dokumen.template.delete

dokumen.surat.create

dokumen.surat.approve

dokumen.surat.print

dokumen.surat.export
```text

---

## Integrasi ERP

Office Editor terintegrasi dengan:

* Master Santri
* Master Pengurus
* Master Jabatan
* Master Department
* Master Role
* Tahun Ajaran
* Keuangan
* Bendahara
* Poskestren
* Pendidikan
* Keamanan
* BUMP
* Laboratorium

Sehingga seluruh surat, formulir, sertifikat, laporan, invoice, kwitansi, dan dokumen administrasi dapat dibuat langsung dari PPDS ERP tanpa memerlukan aplikasi pengolah kata eksternal.
````
