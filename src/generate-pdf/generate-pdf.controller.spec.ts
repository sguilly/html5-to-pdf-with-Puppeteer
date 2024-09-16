import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@s3pweb/nestjs-common';
import { ConvertTools } from '../utils/tools/convert-tool';
import { GeneratePdfController } from './generate-pdf.controller';
import { GeneratePdfService } from './generate-pdf.service';

describe('GeneratePdfController', () => {
  let controller: GeneratePdfController;
  //let service: GeneratePdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneratePdfController],
      providers: [
        GeneratePdfService,
        ConvertTools,
        {
          provide: LoggingService, // Mocker LoggingService
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GeneratePdfController>(GeneratePdfController);
    //service = module.get<GeneratePdfService>(GeneratePdfService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    //expect(service).toBeDefined();
  });
});
