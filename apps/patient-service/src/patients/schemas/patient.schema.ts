import { Schema } from 'dynamoose';

export const PatientSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
  },
  name: { type: String, required: true },
  species: { type: String }, 
  breed: { type: String },
  ownerName: { type: String },
  ownerEmail: { 
    type: String,
    index: {
      name: 'ownerEmailIndex',
      type: 'global'
    }
  },
}, {
  timestamps: true,
});