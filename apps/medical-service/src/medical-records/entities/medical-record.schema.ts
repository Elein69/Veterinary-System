import { Schema } from 'dynamoose';

export const MedicalRecordSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
  },
  patientId: {
    type: String,
    index: {
      name: 'patientId-index',
      type: 'global', // FIX: Use 'type' instead of 'global: true'
    },
  },
  veterinarianId: String,
  diagnosis: String,
  treatment: String,
  date: {
    type: String,
    default: () => new Date().toISOString(),
  },
  notes: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});