import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from 'nestjs-dynamoose';
import { ClientProxy } from '@nestjs/microservices'; // 👈 Importar
import type { Model } from 'nestjs-dynamoose';
import { MedicalRecord, MedicalRecordKey } from './entities/medical-record.interface';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectModel('MedicalRecord')
    private readonly medicalRecordModel: Model<MedicalRecord, MedicalRecordKey>,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientProxy,
  ) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    const record = await this.medicalRecordModel.create({
      id: uuidv4(),
      ...createMedicalRecordDto,
      date: new Date().toISOString(),
    });

    this.kafkaClient.emit('medical_record_created', {
      recordId: record.id,
      patientId: record.patientId,
      diagnosis: record.diagnosis,
      timestamp: new Date()
    });
    console.log(`📢 Evento enviado a Kafka: medical_record_created`);
    
    return record;
  }

  async findAll() {
    return this.medicalRecordModel.scan().exec();
  }

  async findOne(id: string) {
    const record = await this.medicalRecordModel.get({ id });
    if (!record) {
      throw new NotFoundException(`Medical Record with ID ${id} not found`);
    }
    return record;
  }

  async findByPatient(patientId: string) {
    return this.medicalRecordModel.query('patientId').eq(patientId).exec();
  }

  async update(id: string, updateData: Partial<CreateMedicalRecordDto>) {
    await this.findOne(id);
    return this.medicalRecordModel.update({ id }, updateData);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.medicalRecordModel.delete({ id });
  }
}