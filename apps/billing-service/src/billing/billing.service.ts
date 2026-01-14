import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async createInvoice(data: any) {
    this.logger.log(`💰 Creando factura para Cita: ${data.appointmentId}`);
    
    const newInvoice = this.invoiceRepository.create({
      appointmentId: data.appointmentId,
      patientId: data.patientId,
      amount: data.amount,
      currency: data.currency,
    });

    return await this.invoiceRepository.save(newInvoice);
  }
}