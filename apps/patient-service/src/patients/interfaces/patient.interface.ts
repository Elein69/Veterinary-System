export interface PatientKey {
  id: string;
}

export interface Patient extends PatientKey {
  name: string;
  species: string;
  breed: string;
  ownerName: string;
  ownerEmail: string;
}