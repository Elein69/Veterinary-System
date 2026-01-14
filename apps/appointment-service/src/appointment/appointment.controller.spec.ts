import { Test, TestingModule } from '@nestjs/testing';
// 1. Importamos el controlador desde la carpeta appointment
import { AppointmentController } from './appointment.controller';
// 2. Importamos el servicio desde la carpeta appointment
import { AppointmentService } from './appointment.service'; 

describe('AppointmentController', () => {
  let controller: AppointmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useValue: {
            // Mocks de los métodos que tenga tu orquestador de citas
            findAll: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({ id: 1, date: new Date() }),
          },
        },
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});