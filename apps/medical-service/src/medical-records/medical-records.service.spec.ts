import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordsService } from './medical-records.service';
import { getModelToken } from '@nestjs/mongoose'; 

describe('MedicalRecordsService', () => {
  let service: MedicalRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordsService,
        // 1. Mock de Base de Datos
        {
          provide: getModelToken('MedicalRecord'), // Ajusta 'MedicalRecord' si tu modelo se llama distinto
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
          },
        },
        // 2. Mock de Kafka
        {
          provide: 'KAFKA_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MedicalRecordsService>(MedicalRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});