import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {

  // This function listens to the 'crear_factura' event from Kafka
  @EventPattern('crear_factura')
  handleBilling(@Payload() data: any) {
    console.log('💰 [BILLING - KAFKA] Invoice order received:', data);
    // Logic to save invoice would go here
  }
}