import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @Inject('STAFF_KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  async findAll() {
    return await this.staffRepo.find();
  }

  async findOne(id: string) {
    const member = await this.staffRepo.findOneBy({ id });
    if (!member) throw new NotFoundException(`Staff member with ID ${id} not found`);
    return member;
  }

  // --- NUEVO MÉTODO PARA VALIDACIÓN RPC QUE PEDÍA EL CONTROLADOR ---
  async checkAvailability(id: string): Promise<boolean> {
    const member = await this.staffRepo.findOneBy({ id });
    return member ? member.isAvailable : false;
  }

  async create(dto: CreateStaffDto) {
    const newMember = this.staffRepo.create(dto);
    return await this.staffRepo.save(newMember);
  }

  async toggleAvailability(id: string) {
    const member = await this.findOne(id);
    member.isAvailable = !member.isAvailable;
    member.updatedAt = new Date();

    const updatedMember = await this.staffRepo.save(member);

    this.logger.warn(`📢 Status changed: ${member.name} is now ${member.isAvailable ? 'Available' : 'Busy'}`);

    // 📡 EMISIÓN DE EVENTO A KAFKA
    this.kafkaClient.emit('staff_status_changed', {
      staffId: updatedMember.id,
      name: updatedMember.name,
      newStatus: updatedMember.isAvailable,
      timestamp: updatedMember.updatedAt
    });

    return updatedMember;
  }
}