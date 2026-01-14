import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { getModelToken } from '@nestjs/mongoose';

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        // 1. Mock de la Base de Datos (Mongoose)
        {
          provide: getModelToken('Patient'), // O el nombre que uses en @InjectModel('Patient')
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        // 2. Mock de Kafka (Si usas ClientProxy)
        {
          provide: 'KAFKA_SERVICE', // El nombre exacto que usas en @Inject('KAFKA_SERVICE')
          useValue: {
            emit: jest.fn(),
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});