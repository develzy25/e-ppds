'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSantriSchema, updateSantriSchema } from '../validators/santri.validator';
import { SantriEntity } from '../types/santri.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSantriDropdownOptions } from '../actions/santri.action';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SantriFormProps {
  initialData?: SantriEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function SantriForm({ initialData, onSubmit, isSubmitting }: SantriFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateSantriSchema : createSantriSchema;
  
  const [options, setOptions] = useState<any>({ kamars: [], classes: [], academicYears: [] });
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [useManualAddress, setUseManualAddress] = useState(!initialData ? false : true);
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
  const [regencies, setRegencies] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [villages, setVillages] = useState<{ id: string; name: string }[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedRegencyId, setSelectedRegencyId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id || '',
      nis: initialData?.nis || '',
      fullName: initialData?.fullName || initialData?.name || '',
      gender: initialData?.gender || 'L',
      statusAktif: initialData?.statusAktif || 'Aktif',
      roomId: initialData?.roomId || '',
      classFormalId: initialData?.classFormalId || '',
      classDiniyahId: initialData?.classDiniyahId || '',
      academicYearId: initialData?.academicYearId || '',
      pondokId: initialData?.pondokId || 'pondok-1', // Mock pondok
      
      studentStatus: initialData?.studentStatus || '',
      admissionType: initialData?.admissionType || '',
      entryYear: initialData?.entryYear || new Date().getFullYear().toString(),
      registrationWave: initialData?.registrationWave || '',
      registrationNumber: initialData?.registrationNumber || '',
      previousSchool: initialData?.previousSchool || '',
      boardingEntryDate: initialData?.boardingEntryDate || '',
      
      exitYear: initialData?.exitYear || '',
      exitDate: initialData?.exitDate || '',
      exitReason: initialData?.exitReason || '',
      exitNotes: initialData?.exitNotes || '',
      
      photoUrl: initialData?.photoUrl || '',
      nisn: initialData?.nisn || '',
      nik: initialData?.nik || '',
      familyCardNumber: initialData?.familyCardNumber || '',
      birthPlace: initialData?.birthPlace || '',
      birthDate: initialData?.birthDate || '',
      siblingCount: initialData?.siblingCount || null,
      childOrder: initialData?.childOrder || null,
      religion: initialData?.religion || 'Islam',
      hobby: initialData?.hobby || '',
      ambition: initialData?.ambition || '',
      nationality: initialData?.nationality || 'WNI',
      
      bloodType: initialData?.bloodType || '',
      height: initialData?.height || null,
      weight: initialData?.weight || null,
      medicalHistory: initialData?.medicalHistory || '',
      allergies: initialData?.allergies || '',
      emergencyContactName: initialData?.emergencyContactName || '',
      emergencyContactPhone: initialData?.emergencyContactPhone || '',
      
      studentPhone: initialData?.studentPhone || '',
      studentEmail: initialData?.studentEmail || '',
      addressLine1: initialData?.addressLine1 || '',
      addressLine2: initialData?.addressLine2 || '',
      hamlet: initialData?.hamlet || '',
      village: initialData?.village || '',
      rt: initialData?.rt || '',
      rw: initialData?.rw || '',
      district: initialData?.district || '',
      city: initialData?.city || '',
      province: initialData?.province || '',
      postalCode: initialData?.postalCode || '',
      
      fatherNik: initialData?.fatherNik || '',
      fatherName: initialData?.fatherName || '',
      fatherBirthPlace: initialData?.fatherBirthPlace || '',
      fatherBirthDate: initialData?.fatherBirthDate || '',
      fatherOccupation: initialData?.fatherOccupation || '',
      fatherCompany: initialData?.fatherCompany || '',
      fatherJobAddress: initialData?.fatherJobAddress || '',
      fatherEducation: initialData?.fatherEducation || '',
      fatherPhone: initialData?.fatherPhone || '',
      fatherIncome: initialData?.fatherIncome || '',
      
      motherNik: initialData?.motherNik || '',
      motherName: initialData?.motherName || '',
      motherBirthPlace: initialData?.motherBirthPlace || '',
      motherBirthDate: initialData?.motherBirthDate || '',
      motherOccupation: initialData?.motherOccupation || '',
      motherCompany: initialData?.motherCompany || '',
      motherJobAddress: initialData?.motherJobAddress || '',
      motherEducation: initialData?.motherEducation || '',
      motherPhone: initialData?.motherPhone || '',
      motherIncome: initialData?.motherIncome || '',
    }
  });

  const selectedGender = watch('gender');
  const selectedStatus = watch('statusAktif');
  const selectedRoom = watch('roomId');
  const selectedClassFormal = watch('classFormalId');
  const selectedClassDiniyah = watch('classDiniyahId');
  const selectedAcademicYear = watch('academicYearId');

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      const res = await getSantriDropdownOptions();
      if (res.success) {
        setOptions(res.data);
      }
      setLoadingOptions(false);
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error('Error fetching provinces:', err));
  }, []);

  useEffect(() => {
    if (!selectedProvinceId) {
      setRegencies([]);
      return;
    }
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvinceId}.json`)
      .then(res => res.json())
      .then(data => setRegencies(data))
      .catch(err => console.error('Error fetching regencies:', err));
  }, [selectedProvinceId]);

  useEffect(() => {
    if (!selectedRegencyId) {
      setDistricts([]);
      return;
    }
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedRegencyId}.json`)
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error('Error fetching districts:', err));
  }, [selectedRegencyId]);

  useEffect(() => {
    if (!selectedDistrictId) {
      setVillages([]);
      return;
    }
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDistrictId}.json`)
      .then(res => res.json())
      .then(data => setVillages(data))
      .catch(err => console.error('Error fetching villages:', err));
  }, [selectedDistrictId]);

  const handleVillageChange = (villageId: string) => {
    setSelectedVillageId(villageId);
    const village = villages.find(v => v.id === villageId);
    if (!village) return;
    setValue('village', village.name);

    const district = districts.find(d => d.id === selectedDistrictId);
    const query = `${village.name} ${district?.name || ''}`;
    
    // Auto-search postal code based on selected village name
    fetch(`https://kodepos.now.sh/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(result => {
        if (result.status && result.data && result.data.length > 0) {
          setValue('postalCode', result.data[0].postalcode);
        } else {
          // fallback search by district only
          fetch(`https://kodepos.now.sh/search?q=${encodeURIComponent(district?.name || '')}`)
            .then(res2 => res2.json())
            .then(result2 => {
              if (result2.status && result2.data && result2.data.length > 0) {
                setValue('postalCode', result2.data[0].postalcode);
              }
            }).catch(() => {});
        }
      })
      .catch(err => console.error('Error fetching postal code:', err));
  };

  const onFormSubmit = (data: any) => {
    // Cast empty strings to null for integers
    if (data.siblingCount === '') data.siblingCount = null;
    if (data.childOrder === '') data.childOrder = null;
    if (data.height === '') data.height = null;
    if (data.weight === '') data.weight = null;
    
    // Parse to int if not null
    if (data.siblingCount !== null) data.siblingCount = parseInt(data.siblingCount, 10);
    if (data.childOrder !== null) data.childOrder = parseInt(data.childOrder, 10);
    if (data.height !== null) data.height = parseInt(data.height, 10);
    if (data.weight !== null) data.weight = parseInt(data.weight, 10);
    
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pb-1">
      {isEditing && <input type="hidden" {...register('id')} />}
      <input type="hidden" {...register('pondokId')} />

      <Tabs defaultValue="pribadi" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto py-2">
          <TabsTrigger value="pribadi" className="text-xs py-2">Pribadi</TabsTrigger>
          <TabsTrigger value="pendidikan" className="text-xs py-2">Akademik</TabsTrigger>
          <TabsTrigger value="orangtua" className="text-xs py-2">Orang Tua</TabsTrigger>
          <TabsTrigger value="alamat" className="text-xs py-2">Alamat</TabsTrigger>
          <TabsTrigger value="medis" className="text-xs py-2">Medis</TabsTrigger>
        </TabsList>
        
        {/* TAB 1: PRIBADI */}
        <TabsContent value="pribadi" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nis">NIS <span className="text-rose-500">*</span></Label>
              <Input id="nis" placeholder="Misal: 12345678" {...register('nis')} />
              {errors.nis && <p className="text-xs text-rose-500">{errors.nis.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nisn">NISN</Label>
              <Input id="nisn" placeholder="Nomor Induk Siswa Nasional" {...register('nisn')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nik">NIK Santri</Label>
              <Input id="nik" placeholder="Nomor Induk Kependudukan" {...register('nik')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyCardNumber">Nomor KK</Label>
              <Input id="familyCardNumber" placeholder="Nomor Kartu Keluarga" {...register('familyCardNumber')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName">Nama Lengkap <span className="text-rose-500">*</span></Label>
              <Input id="fullName" placeholder="Nama lengkap sesuai KK" {...register('fullName')} />
              {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Tempat Lahir</Label>
              <Input id="birthPlace" placeholder="Kota Kelahiran" {...register('birthPlace')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Tanggal Lahir</Label>
              <Input id="birthDate" type="date" {...register('birthDate')} />
            </div>
            <div className="space-y-2">
              <Label>Jenis Kelamin <span className="text-rose-500">*</span></Label>
              <Select value={selectedGender} onValueChange={(val) => setValue('gender', val)}>
                <SelectTrigger><SelectValue placeholder="Pilih L/P" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki (L)</SelectItem>
                  <SelectItem value="P">Perempuan (P)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Kewarganegaraan</Label>
              <Input id="nationality" placeholder="WNI/WNA" {...register('nationality')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siblingCount">Jumlah Saudara</Label>
              <Input id="siblingCount" type="number" placeholder="0" {...register('siblingCount')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childOrder">Anak Ke-</Label>
              <Input id="childOrder" type="number" placeholder="1" {...register('childOrder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hobby">Hobi</Label>
              <Input id="hobby" placeholder="Membaca, Olahraga..." {...register('hobby')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ambition">Cita-cita</Label>
              <Input id="ambition" placeholder="Dokter, Ulama..." {...register('ambition')} />
            </div>
          </div>
        </TabsContent>
        
        {/* TAB 2: PENDIDIKAN & KAMAR */}
        <TabsContent value="pendidikan" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentStatus">Status Siswa</Label>
              <Select value={watch('studentStatus')} onValueChange={(val) => setValue('studentStatus', val)}>
                <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Alumni">Alumni</SelectItem>
                  <SelectItem value="Cuti">Cuti</SelectItem>
                  <SelectItem value="Keluar">Keluar</SelectItem>
                  <SelectItem value="Pindah">Pindah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admissionType">Jalur Masuk</Label>
              <Select value={watch('admissionType')} onValueChange={(val) => setValue('admissionType', val)}>
                <SelectTrigger><SelectValue placeholder="Pilih Jalur" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baru">Baru</SelectItem>
                  <SelectItem value="Pindahan">Pindahan</SelectItem>
                  <SelectItem value="Mutasi">Mutasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationWave">Gelombang Pendaftaran</Label>
              <Input id="registrationWave" placeholder="Gelombang 1" {...register('registrationWave')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Nomor Pendaftaran</Label>
              <Input id="registrationNumber" placeholder="No Registrasi PPDB" {...register('registrationNumber')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="previousSchool">Asal Sekolah</Label>
              <Input id="previousSchool" placeholder="SD/SMP Asal" {...register('previousSchool')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boardingEntryDate">Tanggal Masuk Pondok</Label>
              <Input id="boardingEntryDate" type="date" {...register('boardingEntryDate')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entryYear">Tahun Masuk Pondok</Label>
              <Input id="entryYear" placeholder="Contoh: 2026" {...register('entryYear')} />
            </div>
            
            {/* Detail Kelulusan / Keluar (Boyong) / Pindah secara kondisional */}
            {(watch('studentStatus') === 'Alumni' || watch('studentStatus') === 'Keluar' || watch('studentStatus') === 'Pindah') && (
              <>
                <div className="col-span-1 md:col-span-2 pt-4 border-t">
                  <h5 className="font-semibold text-xs text-rose-500 uppercase tracking-wider mb-2">Detail Kelulusan / Keluar / Pindah</h5>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exitYear">Tahun Keluar / Kelulusan</Label>
                  <Input id="exitYear" placeholder="Contoh: 2026" {...register('exitYear')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exitDate">Tanggal Keluar / Kelulusan</Label>
                  <Input id="exitDate" type="date" {...register('exitDate')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exitReason">Alasan Keluar</Label>
                  <Select value={watch('exitReason')} onValueChange={(val) => setValue('exitReason', val)}>
                    <SelectTrigger><SelectValue placeholder="Pilih Alasan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lulus">Lulus (Tamat Belajar)</SelectItem>
                      <SelectItem value="Boyong">Boyong (Berhenti Mandiri)</SelectItem>
                      <SelectItem value="Pindah">Pindah Pondok</SelectItem>
                      <SelectItem value="Dikeluarkan">Dikeluarkan (Tindakan Disiplin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exitNotes">Catatan Alasan Keluar</Label>
                  <Input id="exitNotes" placeholder="Catatan tambahan alasan keluar..." {...register('exitNotes')} />
                </div>
              </>
            )}
            
            <div className="col-span-1 md:col-span-2 pt-4 border-t">
              <h5 className="font-medium text-sm text-muted-foreground mb-2">Penempatan</h5>
            </div>
            
            <div className="space-y-2">
              <Label>Tahun Ajaran Masuk <span className="text-rose-500">*</span></Label>
              <Select value={selectedAcademicYear} onValueChange={(val) => setValue('academicYearId', val)}>
                <SelectTrigger><SelectValue placeholder={loadingOptions ? "Memuat..." : "Pilih Tahun Ajaran"} /></SelectTrigger>
                <SelectContent>
                  {options.academicYears?.map((ta: any) => (
                    <SelectItem key={ta.id} value={ta.id}>{ta.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kamar / Asrama</Label>
              <Select value={selectedRoom} onValueChange={(val) => setValue('roomId', val)}>
                <SelectTrigger><SelectValue placeholder={loadingOptions ? "Memuat..." : "Belum ditempatkan"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">-- Belum Ditempatkan --</SelectItem>
                  {options.kamars?.map((kamar: any) => (
                    <SelectItem key={kamar.id} value={kamar.id}>{kamar.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kelas Formal</Label>
              <Select value={selectedClassFormal} onValueChange={(val) => setValue('classFormalId', val)}>
                <SelectTrigger><SelectValue placeholder={loadingOptions ? "Memuat..." : "Belum ditentukan"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">-- Belum Ditentukan --</SelectItem>
                  {options.classes?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.level})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kelas Diniyah</Label>
              <Select value={selectedClassDiniyah} onValueChange={(val) => setValue('classDiniyahId', val)}>
                <SelectTrigger><SelectValue placeholder={loadingOptions ? "Memuat..." : "Belum ditentukan"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">-- Belum Ditentukan --</SelectItem>
                  {options.classes?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.level})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        
        {/* TAB 3: ORANG TUA */}
        <TabsContent value="orangtua" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <div className="space-y-4 border p-4 rounded-lg bg-slate-50/50">
              <h5 className="font-semibold text-primary">Data Ayah</h5>
              <div className="space-y-2">
                <Label htmlFor="fatherNik">NIK Ayah</Label>
                <Input id="fatherNik" placeholder="Nomor Induk Kependudukan Ayah" {...register('fatherNik')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Nama Ayah</Label>
                <Input id="fatherName" placeholder="Nama Lengkap Ayah" {...register('fatherName')} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="fatherBirthPlace">Tempat Lahir</Label>
                  <Input id="fatherBirthPlace" {...register('fatherBirthPlace')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherBirthDate">Tanggal Lahir</Label>
                  <Input id="fatherBirthDate" type="date" {...register('fatherBirthDate')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherOccupation">Pekerjaan</Label>
                <Input id="fatherOccupation" placeholder="Wiraswasta, PNS, dll" {...register('fatherOccupation')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherEducation">Pendidikan Terakhir</Label>
                <Input id="fatherEducation" placeholder="S1, SMA, dll" {...register('fatherEducation')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherPhone">No. Handphone</Label>
                <Input id="fatherPhone" placeholder="0812xxxx" {...register('fatherPhone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherIncome">Penghasilan / Bulan</Label>
                <Select value={watch('fatherIncome')} onValueChange={(val) => setValue('fatherIncome', val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="< 1 Juta">&lt; 1 Juta</SelectItem>
                    <SelectItem value="1 - 3 Juta">1 - 3 Juta</SelectItem>
                    <SelectItem value="3 - 5 Juta">3 - 5 Juta</SelectItem>
                    <SelectItem value="5 - 10 Juta">5 - 10 Juta</SelectItem>
                    <SelectItem value="> 10 Juta">&gt; 10 Juta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 border p-4 rounded-lg bg-slate-50/50">
              <h5 className="font-semibold text-primary">Data Ibu</h5>
              <div className="space-y-2">
                <Label htmlFor="motherNik">NIK Ibu</Label>
                <Input id="motherNik" placeholder="Nomor Induk Kependudukan Ibu" {...register('motherNik')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName">Nama Ibu</Label>
                <Input id="motherName" placeholder="Nama Lengkap Ibu" {...register('motherName')} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="motherBirthPlace">Tempat Lahir</Label>
                  <Input id="motherBirthPlace" {...register('motherBirthPlace')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherBirthDate">Tanggal Lahir</Label>
                  <Input id="motherBirthDate" type="date" {...register('motherBirthDate')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherOccupation">Pekerjaan</Label>
                <Input id="motherOccupation" placeholder="Ibu Rumah Tangga, Guru, dll" {...register('motherOccupation')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherEducation">Pendidikan Terakhir</Label>
                <Input id="motherEducation" placeholder="S1, SMA, dll" {...register('motherEducation')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherPhone">No. Handphone</Label>
                <Input id="motherPhone" placeholder="0812xxxx" {...register('motherPhone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherIncome">Penghasilan / Bulan</Label>
                <Select value={watch('motherIncome')} onValueChange={(val) => setValue('motherIncome', val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="< 1 Juta">&lt; 1 Juta</SelectItem>
                    <SelectItem value="1 - 3 Juta">1 - 3 Juta</SelectItem>
                    <SelectItem value="3 - 5 Juta">3 - 5 Juta</SelectItem>
                    <SelectItem value="5 - 10 Juta">5 - 10 Juta</SelectItem>
                    <SelectItem value="> 10 Juta">&gt; 10 Juta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* TAB 4: ALAMAT */}
        <TabsContent value="alamat" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine1">Alamat / Nama Jalan</Label>
              <Input id="addressLine1" placeholder="Jl. Raya Utama No 123..." {...register('addressLine1')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine2">Detail Tambahan (Gang / Blok)</Label>
              <Input id="addressLine2" placeholder="Blok C, Gang Buntu..." {...register('addressLine2')} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hamlet">Dusun</Label>
              <Input id="hamlet" placeholder="Dusun / Lingkungan" {...register('hamlet')} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="rt">RT</Label>
                <Input id="rt" placeholder="001" {...register('rt')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rw">RW</Label>
                <Input id="rw" placeholder="002" {...register('rw')} />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2 flex items-center justify-between border-b pb-2">
              <Label className="text-xs font-bold text-primary uppercase tracking-wider">Metode Input Wilayah</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="toggle-address-mode"
                  checked={useManualAddress}
                  onChange={(e) => setUseManualAddress(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <Label htmlFor="toggle-address-mode" className="text-xs font-bold cursor-pointer text-muted-foreground select-none">
                  Input Manual (Bypass API Wilayah)
                </Label>
              </div>
            </div>

            {useManualAddress ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="province">Provinsi</Label>
                  <Input id="province" placeholder="Nama Provinsi" {...register('province')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Kabupaten / Kota</Label>
                  <Input id="city" placeholder="Nama Kab/Kota" {...register('city')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">Kecamatan</Label>
                  <Input id="district" placeholder="Nama Kecamatan" {...register('district')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Desa / Kelurahan</Label>
                  <Input id="village" placeholder="Nama Desa" {...register('village')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Kode Pos</Label>
                  <Input id="postalCode" placeholder="Kode Pos" {...register('postalCode')} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="province-select">Provinsi</Label>
                  <select
                    id="province-select"
                    value={selectedProvinceId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedProvinceId(id);
                      setSelectedRegencyId('');
                      setSelectedDistrictId('');
                      setSelectedVillageId('');
                      const prov = provinces.find(p => p.id === id);
                      if (prov) setValue('province', prov.name);
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary/50 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regency-select">Kabupaten / Kota</Label>
                  <select
                    id="regency-select"
                    value={selectedRegencyId}
                    disabled={!selectedProvinceId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedRegencyId(id);
                      setSelectedDistrictId('');
                      setSelectedVillageId('');
                      const reg = regencies.find(r => r.id === id);
                      if (reg) setValue('city', reg.name);
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary/50 focus:outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">-- Pilih Kabupaten / Kota --</option>
                    {regencies.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district-select">Kecamatan</Label>
                  <select
                    id="district-select"
                    value={selectedDistrictId}
                    disabled={!selectedRegencyId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedDistrictId(id);
                      setSelectedVillageId('');
                      const dist = districts.find(d => d.id === id);
                      if (dist) setValue('district', dist.name);
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary/50 focus:outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">-- Pilih Kecamatan --</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village-select">Desa / Kelurahan</Label>
                  <select
                    id="village-select"
                    value={selectedVillageId}
                    disabled={!selectedDistrictId}
                    onChange={(e) => {
                      const id = e.target.value;
                      handleVillageChange(id);
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary/50 focus:outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">-- Pilih Desa / Kelurahan --</option>
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="postalCode">Kode Pos (Otomatis)</Label>
                  <Input id="postalCode" placeholder="Akan terisi otomatis setelah memilih kelurahan..." {...register('postalCode')} />
                </div>
              </>
            )}
          </div>
        </TabsContent>
        
        {/* TAB 5: MEDIS */}
        <TabsContent value="medis" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Golongan Darah</Label>
              <Select value={watch('bloodType')} onValueChange={(val) => setValue('bloodType', val)}>
                <SelectTrigger><SelectValue placeholder="Pilih Gol. Darah" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="AB">AB</SelectItem>
                  <SelectItem value="O">O</SelectItem>
                  <SelectItem value="Tidak Tahu">Tidak Tahu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="height">Tinggi (cm)</Label>
                <Input id="height" type="number" placeholder="160" {...register('height')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Berat (kg)</Label>
                <Input id="weight" type="number" placeholder="50" {...register('weight')} />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="medicalHistory">Riwayat Penyakit (Kronis/Keras)</Label>
              <Input id="medicalHistory" placeholder="Kosongkan jika tidak ada" {...register('medicalHistory')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="allergies">Alergi (Obat/Makanan)</Label>
              <Input id="allergies" placeholder="Kosongkan jika tidak ada" {...register('allergies')} />
            </div>
            
            <div className="col-span-1 md:col-span-2 pt-4 border-t">
              <h5 className="font-medium text-sm text-muted-foreground mb-2">Kontak Darurat</h5>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Nama Kontak Darurat</Label>
              <Input id="emergencyContactName" placeholder="Nama wali/keluarga terdekat" {...register('emergencyContactName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Telepon Kontak Darurat</Label>
              <Input id="emergencyContactPhone" placeholder="0812xxxx" {...register('emergencyContactPhone')} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan Santri'}
        </Button>
      </div>
    </form>
  );
}
