import { Test, TestingModule } from '@nestjs/testing';
import { NotificationServiceController } from './notification-service.controller';

describe('NotificationServiceController', () => {
  let controller: NotificationServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationServiceController],
      // No agregamos providers porque tu controlador no usa @Injectable() services
    }).compile();

    controller = module.get<NotificationServiceController>(NotificationServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('debe tener definidos los manejadores de eventos de Kafka', () => {
    // Verificamos que los métodos que el ingeniero te pidió existan
    expect(controller.handleLowStock).toBeDefined();
    expect(controller.handleStaffStatus).toBeDefined();
    expect(controller.handlePatientCreated).toBeDefined();
    expect(controller.handleInvoice).toBeDefined();
    expect(controller.handleIotAlert).toBeDefined();
    expect(controller.handleAppointment).toBeDefined();
  });
});