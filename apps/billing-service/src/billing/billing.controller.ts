import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BillingService } from './billing.service';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // 👇 Escuchamos el evento que manda Appointment Service
  @EventPattern('crear_factura')
  async handleInvoice(@Payload() data: any) {
    // Si llega como string, lo parseamos
    const payload = typeof data === 'string' ? JSON.parse(data) : data;
    console.log('📨 Kafka Message received:', payload);
    
    await this.billingService.createInvoice(payload);
  }
}