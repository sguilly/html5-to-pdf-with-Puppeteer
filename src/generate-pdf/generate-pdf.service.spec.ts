import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@s3pweb/nestjs-common';
import { Cluster } from 'puppeteer-cluster';
import { GeneratePdfFromUrlDto } from './dto/generate-pdf-url-dto';
import { GeneratePdfService } from './generate-pdf.service';

// complete cluster mock
jest.mock('puppeteer-cluster', () => ({
  Cluster: {
    launch: jest.fn(),
  },
}));

describe('GeneratePdfService', () => {
  let service: GeneratePdfService;
  let cluster: any;

  const mockLoggingService = {
    getLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
  };

  beforeEach(async () => {
    cluster = {
      execute: jest.fn(),
      on: jest.fn(),
      close: jest.fn(),
    };

    // Simulate Cluster.launch response
    (Cluster.launch as jest.Mock).mockResolvedValue(cluster);

    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneratePdfService, { provide: LoggingService, useValue: mockLoggingService }],
    }).compile();

    service = module.get<GeneratePdfService>(GeneratePdfService);

    // Initialize module and simulates cluster initialization in onModuleInit
    await service.onModuleInit('test-uuid');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generate', () => {
    const params: GeneratePdfFromUrlDto = {
      url: 'https://example.com',
      format: 'pdf',
    };

    const uuid = 'generatePdfService';

    it('should handle errors during task execution', async () => {
      const error = new Error('Task failed');
      cluster.execute.mockRejectedValueOnce(error);
      const loggerErrorSpy = jest.spyOn(mockLoggingService.getLogger(), 'error');

      await expect(service.generate(uuid, params)).rejects.toThrow('Failed to generate content');
      expect(loggerErrorSpy).toHaveBeenCalledWith({ uuid: uuid }, 'Error generating content:', error);
    });
  });

  describe('onModuleDestroy', () => {
    const uuid = 'onModuleDestroy';
    it('should close the cluster on module destroy', async () => {
      await service.onModuleDestroy(uuid);
      expect(cluster.close).toHaveBeenCalled();
    });
  });
});
