import { Test, TestingModule } from '@nestjs/testing';
import { InventoryServiceController } from './inventory-service.controller';
import { InventoryService } from './app.service'; 

describe('InventoryServiceController', () => {
  let inventoryController: InventoryServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InventoryServiceController],
      providers: [
        { 
          provide: InventoryService, 
          useValue: { 
            // Mock de los métodos que tenga tu servicio (ejemplo findAll)
            findAll: jest.fn().mockResolvedValue([]),
            getHello: jest.fn().mockReturnValue('Hello Inventory'),
          } 
        },
      ],
    }).compile();

    inventoryController = app.get<InventoryServiceController>(InventoryServiceController);
  });

  it('should be defined', () => {
    expect(inventoryController).toBeDefined();
  });
});