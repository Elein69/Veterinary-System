import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Importamos la clase (aunque la vamos a mockear)
import { TelemetryService } from './telemetry/telemetry.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        // AQUÍ ESTÁ EL TRUCO: Mockeamos el TelemetryService
        {
          provide: TelemetryService,
          useValue: {
            logData: jest.fn(), // Simulamos las funciones que uses
            getReadings: jest.fn().mockReturnValue([]),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });
});