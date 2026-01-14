import { Test, TestingModule } from '@nestjs/testing';
// 1. Importamos el controlador desde la carpeta billing
import { BillingController } from './billing.controller';
// 2. Importamos el servicio (ajusta el nombre si en tu archivo es diferente)
import { BillingService } from './billing.service'; 

describe('BillingController', () => {
  let controller: BillingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        {
          provide: BillingService,
          useValue: {
            // Simulamos los métodos que tiene tu servicio de facturación
            findAll: jest.fn().mockResolvedValue([]),
            createInvoice: jest.fn().mockResolvedValue({ id: '1', total: 100 }),
          },
        },
      ],
    }).compile();

    controller = module.get<BillingController>(BillingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});