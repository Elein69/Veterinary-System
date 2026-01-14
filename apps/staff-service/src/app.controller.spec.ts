import { Test, TestingModule } from '@nestjs/testing';
// 1. Importamos el controlador (fíjate que el nombre coincida con tu clase)
import { StaffServiceController } from './staff-service.controller'; 
// 2. Importamos el servicio (fíjate que el nombre coincida con tu clase en app.service.ts)
import { StaffService } from './app.service'; 

describe('StaffServiceController', () => {
  let controller: StaffServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffServiceController],
      providers: [
        {
          // 3. Aquí usamos el nombre de la clase de app.service.ts
          provide: StaffService, 
          useValue: {
            // Simulamos (Mock) los métodos para que el test no use la base de datos real
            findAll: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({}),
            toggleAvailability: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<StaffServiceController>(StaffServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});