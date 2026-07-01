import { z } from 'zod';

export const createSantriSchema = z.object({
  nis: z.string().min(1, 'NIS wajib diisi'),
  name: z.string().optional().nullable(), // Deprecated, but allow it if passed
  fullName: z.string().min(1, 'Nama lengkap wajib diisi').max(150, 'Maksimal 150 karakter').optional().nullable(),
  
  // STATUS & ENROLLMENT
  studentStatus: z.string().optional().nullable(),
  admissionType: z.string().optional().nullable(),
  entryYear: z.string().optional().nullable(),
  registrationWave: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  previousSchool: z.string().optional().nullable(),
  boardingEntryDate: z.string().optional().nullable(),
  
  // EXIT DETAILS
  exitYear: z.string().optional().nullable(),
  exitDate: z.string().optional().nullable(),
  exitReason: z.string().optional().nullable(),
  exitNotes: z.string().optional().nullable(),
  
  // PERSONAL DATA
  photoUrl: z.string().optional().nullable(),
  nisn: z.string().optional().nullable(),
  nik: z.string().optional().nullable(),
  familyCardNumber: z.string().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(['L', 'P']),
  siblingCount: z.number().int().optional().nullable(),
  childOrder: z.number().int().optional().nullable(),
  religion: z.string().optional().nullable(),
  hobby: z.string().optional().nullable(),
  ambition: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  
  // MEDICAL & EMERGENCY
  bloodType: z.string().optional().nullable(),
  height: z.number().int().optional().nullable(),
  weight: z.number().int().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  
  // CONTACT & ADDRESS
  studentPhone: z.string().optional().nullable(),
  studentEmail: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  hamlet: z.string().optional().nullable(),
  village: z.string().optional().nullable(),
  rt: z.string().optional().nullable(),
  rw: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  
  // PARENT (FATHER)
  fatherNik: z.string().optional().nullable(),
  fatherName: z.string().optional().nullable(),
  fatherBirthPlace: z.string().optional().nullable(),
  fatherBirthDate: z.string().optional().nullable(),
  fatherOccupation: z.string().optional().nullable(),
  fatherCompany: z.string().optional().nullable(),
  fatherJobAddress: z.string().optional().nullable(),
  fatherEducation: z.string().optional().nullable(),
  fatherPhone: z.string().optional().nullable(),
  fatherIncome: z.string().optional().nullable(),
  
  // PARENT (MOTHER)
  motherNik: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  motherBirthPlace: z.string().optional().nullable(),
  motherBirthDate: z.string().optional().nullable(),
  motherOccupation: z.string().optional().nullable(),
  motherCompany: z.string().optional().nullable(),
  motherJobAddress: z.string().optional().nullable(),
  motherEducation: z.string().optional().nullable(),
  motherPhone: z.string().optional().nullable(),
  motherIncome: z.string().optional().nullable(),

  // RELATIONS
  statusAktif: z.enum(['Aktif', 'Alumni']).default('Aktif'),
  roomId: z.string().optional().nullable(),
  classFormalId: z.string().optional().nullable(),
  classDiniyahId: z.string().optional().nullable(),
  academicYearId: z.string().min(1, 'Tahun Ajaran wajib dipilih'),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateSantriSchema = createSantriSchema.extend({
  id: z.string().min(1, 'ID Santri wajib diisi'),
});

export type CreateSantriInput = z.infer<typeof createSantriSchema>;
export type UpdateSantriInput = z.infer<typeof updateSantriSchema>;
