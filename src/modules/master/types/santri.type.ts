import { KamarEntity } from './kamar.type';
import { KelasEntity } from './kelas.type';
import { TahunAjaranEntity } from './tahun-ajaran.type';

export interface SantriEntity {
  id: string;
  nis: string;
  name: string; // DEPRECATED
  fullName: string | null;
  
  // STATUS & ENROLLMENT
  studentStatus: string | null;
  admissionType: string | null;
  entryYear: string | null;
  registrationWave: string | null;
  registrationNumber: string | null;
  previousSchool: string | null;
  boardingEntryDate: string | null;
  
  // EXIT DETAILS (Lulus / Boyong / Pindah)
  exitYear: string | null;
  exitDate: string | null;
  exitReason: string | null;
  exitNotes: string | null;
  
  // PERSONAL DATA
  photoUrl: string | null;
  nisn: string | null;
  nik: string | null;
  familyCardNumber: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  gender: string;
  siblingCount: number | null;
  childOrder: number | null;
  religion: string | null;
  hobby: string | null;
  ambition: string | null;
  nationality: string | null;
  
  // MEDICAL & EMERGENCY
  bloodType: string | null;
  height: number | null;
  weight: number | null;
  medicalHistory: string | null;
  allergies: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  
  // CONTACT & ADDRESS
  studentPhone: string | null;
  studentEmail: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  hamlet: string | null;
  village: string | null;
  rt: string | null;
  rw: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  
  // PARENT (FATHER)
  fatherNik: string | null;
  fatherName: string | null;
  fatherBirthPlace: string | null;
  fatherBirthDate: string | null;
  fatherOccupation: string | null;
  fatherCompany: string | null;
  fatherJobAddress: string | null;
  fatherEducation: string | null;
  fatherPhone: string | null;
  fatherIncome: string | null;
  
  // PARENT (MOTHER)
  motherNik: string | null;
  motherName: string | null;
  motherBirthPlace: string | null;
  motherBirthDate: string | null;
  motherOccupation: string | null;
  motherCompany: string | null;
  motherJobAddress: string | null;
  motherEducation: string | null;
  motherPhone: string | null;
  motherIncome: string | null;

  // RELATIONS (EXISTING)
  statusAktif: string; // "Aktif" | "Alumni"
  roomId: string | null;
  classFormalId: string | null;
  classDiniyahId: string | null;
  academicYearId: string;
  pondokId: string;
  
  // AUDIT
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  
  // Relations mapped
  kamar?: KamarEntity;
  classFormal?: KelasEntity;
  classDiniyah?: KelasEntity;
  academicYear?: TahunAjaranEntity;
}
