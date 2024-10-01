import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'maxConcurrency') {
        return 3;
      }
      return null; // Return null if key different to maxConcurrency
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
      providers: [
        ConfigService,
        GeneratePdfService,
        { provide: LoggingService, useValue: mockLoggingService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<GeneratePdfService>(GeneratePdfService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    const uuid = 'test-uuid';

    it('should initialize the cluster and set status to active', async () => {
      // Initialize module and simulates cluster initialization in onModuleInit
      await service.onModuleInit(uuid);

      // Check that Cluster.launch was called with appropriate options
      expect(Cluster.launch).toHaveBeenCalledWith({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 3, // Based on the mockConfigService
        puppeteerOptions: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        },
      });

      // Check that service status is updated to active
      expect(service['status']).toBe('active');
      expect(mockLoggingService.getLogger().info).toHaveBeenCalledWith({ uuid }, 'Cluster initialized successfully');
    });

    it('should throw BadRequestException if maxConcurrency is invalid', async () => {
      // Change mock config to return invalid value
      mockConfigService.get.mockReturnValueOnce(null);
      await expect(service.onModuleInit(uuid)).rejects.toThrow(BadRequestException);
      // Ensure cluster will not be initialize
      expect(Cluster.launch).not.toHaveBeenCalled();
      // Check that log captured the error
      expect(mockLoggingService.getLogger().error).toHaveBeenCalledWith(
        { uuid },
        'Failed to initialize Puppeteer cluster',
        expect.any(String), //stack error
      );
    });

    it('should handle errors during cluster initialization and set status to closed', async () => {
      const error = new Error('Cluster initialization failed');
      (Cluster.launch as jest.Mock).mockRejectedValueOnce(error);

      await expect(service.onModuleInit(uuid)).rejects.toThrow(error);
      // Check that cluster status was updated to 'closed' after the failure
      expect(service['status']).toBe('closed');
      // Check that error was logged
      expect(mockLoggingService.getLogger().error).toHaveBeenCalledWith(
        { uuid },
        'Failed to initialize Puppeteer cluster',
        expect.any(String), // Error stack
      );
    });
  });

  describe('generate', () => {
    const params: GeneratePdfFromUrlDto = {
      url: 'https://example.com',
      format: 'pdf',
    };

    const uuid = 'generatePdfService';

    it('should handle errors during task execution', async () => {
      //Initialize module and simulates cluster initialization in onModuleInit after fail in tst before
      await service.onModuleInit(uuid);
      const error = new Error('Task failed');
      cluster.execute.mockRejectedValueOnce(error);
      const loggerErrorSpy = jest.spyOn(mockLoggingService.getLogger(), 'error');

      await expect(service.generate(uuid, params)).rejects.toThrow('Error generating PDF or Image');
      expect(loggerErrorSpy).toHaveBeenCalledWith({ uuid: uuid }, `Error generating content: ${error.message}`);
    });
  });

  describe('onModuleDestroy', () => {
    const uuid = 'onModuleDestroy';

    it('should close the cluster on module destroy', async () => {
      //Initialize module and simulates cluster initialization in onModuleInit to ensure the initial status is 'active'
      await service.onModuleInit(uuid);
      await service.onModuleDestroy(uuid);
      // Check if the cluster close method was called
      expect(cluster.close).toHaveBeenCalled();
      // Check if the status has been updated to 'closed'
      expect(service['status']).toBe('closed');
    });

    it('should handle closing cluster when it is not initialized', async () => {
      // reset service status to init
      service['status'] = 'initializing';
      // Simulate the scenario where the cluster is not initialized
      service['cluster'] = null;

      const loggerWarnSpy = jest.spyOn(mockLoggingService.getLogger(), 'warn');
      await service.onModuleDestroy(uuid);
      // Check if the cluster close method was not called
      expect(cluster.close).not.toHaveBeenCalled();
      // Check if the status still unchanged
      expect(service['status']).toBe('initializing');
      // Check if log was recorded
      expect(loggerWarnSpy).toHaveBeenCalledWith({ uuid }, 'Cluster instance was not initialized');
    });
  });
});
