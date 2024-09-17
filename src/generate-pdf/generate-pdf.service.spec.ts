import { Test, TestingModule } from '@nestjs/testing';
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

  beforeEach(async () => {
    cluster = {
      execute: jest.fn(),
      on: jest.fn(),
      close: jest.fn(),
    };

    // Simulate Cluster.launch response
    (Cluster.launch as jest.Mock).mockResolvedValue(cluster);

    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneratePdfService],
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
    //   const mockBuffer = Buffer.from('mock-pdf');

    //   // Moquer les méthodes de ConvertTools
    //   (ConvertTools.loadPage as jest.Mock).mockImplementationOnce(() => Promise.resolve());
    //   (ConvertTools.waitForImages as jest.Mock).mockResolvedValueOnce(undefined);
    //   (ConvertTools.setPageDimensions as jest.Mock).mockResolvedValueOnce(undefined);
    //   (ConvertTools.generatePdf as jest.Mock).mockResolvedValueOnce(mockBuffer);

    //   // Simuler le retour de cluster.execute
    //   cluster.execute.mockResolvedValueOnce({
    //     code: 200,
    //     headers: {
    //       'Content-Type': 'application/pdf',
    //       'Content-Length': mockBuffer.length,
    //     },
    //     buffer: mockBuffer,
    //   });

    //   const result = await service.generate(params);

    //   expect(cluster.execute).toHaveBeenCalledWith(params, expect.any(Function));
    //   expect(result).toEqual({
    //     code: 200,
    //     headers: {
    //       'Content-Type': 'application/pdf',
    //       'Content-Length': mockBuffer.length,
    //     },
    //     buffer: mockBuffer,
    //   });
    // });

    it('should handle errors during task execution', async () => {
      const error = new Error('Task failed');
      cluster.execute.mockRejectedValueOnce(error);
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      await expect(service.generate(params)).rejects.toThrow('Failed to generate content');
      expect(loggerErrorSpy).toHaveBeenCalledWith('Error generating content:', error);
    });
  });

  describe('onModuleDestroy', () => {
    it('should close the cluster on module destroy', async () => {
      await service.onModuleDestroy();
      expect(cluster.close).toHaveBeenCalled();
    });
  });
});
