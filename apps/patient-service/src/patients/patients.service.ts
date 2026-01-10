import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  create(createPatientDto: CreatePatientDto) {
    const patient = this.patientsRepository.create(createPatientDto);
    return this.patientsRepository.save(patient);
  }

  findAll() {
    return this.patientsRepository.find();
  }

  async findOne(id: string) {
    const patient = await this.patientsRepository.findOneBy({ id });
    if (!patient) throw new NotFoundException(`Patient with ID ${id} not found`);
    return patient;
  }

  findByOwner(ownerId: string) {
    return this.patientsRepository.findBy({ ownerId });
  }
}