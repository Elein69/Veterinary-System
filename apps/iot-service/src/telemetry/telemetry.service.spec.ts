import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryService } from './telemetry.service';
import { ConfigService } from '@nestjs/config';

describe('TelemetryService', () => {
  let service: TelemetryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryService,
        // AQUÍ ESTÁ EL TRUCO: Mockeamos el ConfigService
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('some-config-value'),
          },
        },
      ],
    }).compile();

    service = module.get<TelemetryService>(TelemetryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
