export interface MedicalRecordKey {
  id: string;
}

export interface MedicalRecord extends MedicalRecordKey {
  patientId: string;
  veterinarianId: string;
  diagnosis: string;
  treatment: string;
  date: string;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}