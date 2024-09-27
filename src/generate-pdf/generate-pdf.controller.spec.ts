import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@s3pweb/nestjs-common';
import { GeneratePdfController } from './generate-pdf.controller';
import { GeneratePdfService } from './generate-pdf.service';

describe('GeneratePdfController', () => {
  let controller: GeneratePdfController;
  //let service: GeneratePdfService;

  const mockLoggingService = {
    getLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneratePdfController],
      providers: [
        GeneratePdfService,
        {
          provide: LoggingService, // Mocker LoggingService
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    controller = module.get<GeneratePdfController>(GeneratePdfController);
    //service = module.get<GeneratePdfService>(GeneratePdfService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
