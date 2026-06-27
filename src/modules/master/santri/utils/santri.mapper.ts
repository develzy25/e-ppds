import { SantriEntity } from '../types/santri.type';

export type ExportMode = 'ringkas' | 'administrasi' | 'master';

/**
 * Memetakan SantriEntity menjadi flat object untuk diexport ke Excel
 */
export function exportSantri(santri: SantriEntity, mode: ExportMode): Record<string, any> {
  const base = {
    'NIS': santri.nis,
    'Nama Lengkap': santri.fullName || santri.name,
    'Jenis Kelamin': santri.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
  };

  if (mode === 'ringkas') {
    return {
      ...base,
      'Kamar': santri.kamar?.name || '-',
      'Kelas Formal': santri.classFormal?.name || '-',
      'Status': santri.studentStatus || santri.statusAktif,
    };
  }

  const administrasi = {
    'NIS': santri.nis,
    'Foto Santri': santri.photoUrl || '',
    'Nama Lengkap': santri.fullName || santri.name,
    'Kamar': santri.kamar?.name || '',
    'Masuk Pondok': santri.boardingEntryDate || '',
    'NISN': santri.nisn || '',
    'NIK': santri.nik || '',
    'Tempat, Tanggal Lahir': `${santri.birthPlace || ''}, ${santri.birthDate || ''}`.replace(/^, | , $/g, '').trim(),
    'Jenis Kelamin': santri.gender,
    'Jumlah Saudara': santri.siblingCount || '',
    'Anak Ke': santri.childOrder || '',
    'Agama': santri.religion || '',
    'Hobi': santri.hobby || '',
    'Cita-Cita': santri.ambition || '',
    'Kewarganegaraan': santri.nationality || '',
    'Kelas': santri.classFormal?.name || '',
    'No. KK': santri.familyCardNumber || '',
    'NIK Ayah': santri.fatherNik || '',
    'Nama Ayah': santri.fatherName || '',
    'TTL Ayah': `${santri.fatherBirthPlace || ''}, ${santri.fatherBirthDate || ''}`.replace(/^, | , $/g, '').trim(),
    'Pekerjaan Utama Ayah': santri.fatherOccupation || '',
    'Pendidikan Terakhir Ayah': santri.fatherEducation || '',
    'No. HP Ayah': santri.fatherPhone || '',
    'Penghasilan Ayah': santri.fatherIncome || '',
    'NIK Ibu': santri.motherNik || '',
    'Nama Ibu': santri.motherName || '',
    'TTL Ibu': `${santri.motherBirthPlace || ''}, ${santri.motherBirthDate || ''}`.replace(/^, | , $/g, '').trim(),
    'Pekerjaan Utama Ibu': santri.motherOccupation || '',
    'Pendidikan Terakhir Ibu': santri.motherEducation || '',
    'No. HP Ibu': santri.motherPhone || '',
    'Alamat / Jalan': santri.addressLine1 || '',
    'Dusun': santri.hamlet || '',
    'Desa / Kelurahan': santri.village || '',
    'RT': santri.rt || '',
    'RW': santri.rw || '',
    'Kecamatan': santri.district || '',
    'Kabupaten / Kota': santri.city || '',
    'Provinsi': santri.province || '',
    'Kode Pos': santri.postalCode || '',
  };

  if (mode === 'administrasi') {
    return administrasi;
  }

  // Master mode includes everything (System IDs, Audit data, etc)
  return {
    'ID (Sistem)': santri.id,
    ...administrasi,
    'Pondok ID': santri.pondokId,
    'Room ID': santri.roomId || '',
    'Class Formal ID': santri.classFormalId || '',
    'Class Diniyah ID': santri.classDiniyahId || '',
    'Academic Year ID': santri.academicYearId,
    'Status Sistem': santri.statusAktif,
    'Tipe Masuk': santri.admissionType || '',
    'Tahun Masuk': santri.entryYear || '',
    'Gelombang PPDB': santri.registrationWave || '',
    'No Registrasi': santri.registrationNumber || '',
    'Asal Sekolah': santri.previousSchool || '',
    'Golongan Darah': santri.bloodType || '',
    'Tinggi Badan': santri.height || '',
    'Berat Badan': santri.weight || '',
    'Riwayat Penyakit': santri.medicalHistory || '',
    'Alergi': santri.allergies || '',
    'Nama Kontak Darurat': santri.emergencyContactName || '',
    'Telepon Kontak Darurat': santri.emergencyContactPhone || '',
    'Dibuat Pada': santri.createdAt,
    'Diupdate Pada': santri.updatedAt,
  };
}

/**
 * Memetakan dari baris Excel (dengan header Bahasa Indonesia) menjadi partial DTO
 */
export function importSantriRow(row: Record<string, any>): Partial<SantriEntity> {
  const data: Partial<SantriEntity> = {};

  if (row['Nama Lengkap']) data.fullName = String(row['Nama Lengkap']);
  if (row['NIS']) data.nis = String(row['NIS']);
  if (row['NISN']) data.nisn = String(row['NISN']);
  if (row['NIK']) data.nik = String(row['NIK']);
  if (row['Masuk Pondok']) data.boardingEntryDate = String(row['Masuk Pondok']);
  if (row['Jenis Kelamin']) data.gender = String(row['Jenis Kelamin']).toUpperCase() === 'P' ? 'P' : 'L';
  
  if (row['Tempat, Tanggal Lahir']) {
    const parts = String(row['Tempat, Tanggal Lahir']).split(',');
    if (parts.length > 0) data.birthPlace = parts[0].trim();
    if (parts.length > 1) data.birthDate = parts.slice(1).join(',').trim();
  }

  if (row['Jumlah Saudara']) data.siblingCount = parseInt(row['Jumlah Saudara']) || null;
  if (row['Anak Ke']) data.childOrder = parseInt(row['Anak Ke']) || null;
  
  if (row['Agama']) data.religion = String(row['Agama']);
  if (row['Hobi']) data.hobby = String(row['Hobi']);
  if (row['Cita-Cita']) data.ambition = String(row['Cita-Cita']);
  if (row['Kewarganegaraan']) data.nationality = String(row['Kewarganegaraan']);
  if (row['No. KK']) data.familyCardNumber = String(row['No. KK']);

  if (row['NIK Ayah']) data.fatherNik = String(row['NIK Ayah']);
  if (row['Nama Ayah']) data.fatherName = String(row['Nama Ayah']);
  if (row['TTL Ayah']) {
    const parts = String(row['TTL Ayah']).split(',');
    if (parts.length > 0) data.fatherBirthPlace = parts[0].trim();
    if (parts.length > 1) data.fatherBirthDate = parts.slice(1).join(',').trim();
  }
  if (row['Pekerjaan Utama Ayah']) data.fatherOccupation = String(row['Pekerjaan Utama Ayah']);
  if (row['Pendidikan Terakhir Ayah']) data.fatherEducation = String(row['Pendidikan Terakhir Ayah']);
  if (row['No. HP Ayah']) data.fatherPhone = String(row['No. HP Ayah']);
  if (row['Penghasilan Ayah']) data.fatherIncome = String(row['Penghasilan Ayah']);

  if (row['NIK Ibu']) data.motherNik = String(row['NIK Ibu']);
  if (row['Nama Ibu']) data.motherName = String(row['Nama Ibu']);
  if (row['TTL Ibu']) {
    const parts = String(row['TTL Ibu']).split(',');
    if (parts.length > 0) data.motherBirthPlace = parts[0].trim();
    if (parts.length > 1) data.motherBirthDate = parts.slice(1).join(',').trim();
  }
  if (row['Pekerjaan Utama Ibu']) data.motherOccupation = String(row['Pekerjaan Utama Ibu']);
  if (row['Pendidikan Terakhir Ibu']) data.motherEducation = String(row['Pendidikan Terakhir Ibu']);
  if (row['No. HP Ibu']) data.motherPhone = String(row['No. HP Ibu']);

  if (row['Alamat / Jalan']) data.addressLine1 = String(row['Alamat / Jalan']);
  if (row['Dusun']) data.hamlet = String(row['Dusun']);
  if (row['Desa / Kelurahan']) data.village = String(row['Desa / Kelurahan']);
  if (row['RT']) data.rt = String(row['RT']);
  if (row['RW']) data.rw = String(row['RW']);
  if (row['Kecamatan']) data.district = String(row['Kecamatan']);
  if (row['Kabupaten / Kota']) data.city = String(row['Kabupaten / Kota']);
  if (row['Provinsi']) data.province = String(row['Provinsi']);
  if (row['Kode Pos']) data.postalCode = String(row['Kode Pos']);

  return data;
}
