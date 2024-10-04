import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@s3pweb/nestjs-common';
import { Cluster } from 'puppeteer-cluster';
import { getSpecProvidersImport } from '../../test/util/providers.utils';
import { GeneratePdfFromHtmlDto } from './dto/generate-pdf-html-dto';
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
  let cluster: jest.Mocked<Cluster<GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto>>;
  let mockConfigService: any;
  let mockLoggingService: any;

  beforeEach(async () => {
    cluster = {
      execute: jest.fn(),
      on: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<Cluster<GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto>>;

    // Simulate Cluster.launch response
    (Cluster.launch as jest.Mock).mockResolvedValue(cluster);

    // mock providers using the utility function with service context
    const mockProviders = getSpecProvidersImport(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneratePdfService, ...mockProviders],
    }).compile();

    service = module.get<GeneratePdfService>(GeneratePdfService);
    mockConfigService = module.get<ConfigService>(ConfigService); // Recover the exact instance used by the module
    mockLoggingService = module.get<LoggingService>(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    const uuid = 'test-uuid';

    it('should initialize the cluster and set status to active', async () => {
      // Initialize module and simulates cluster initialization in onModuleInit
      await service.onModuleInit(uuid);
      // get maxConcurrency from mockConfigService
      const maxConcurrency = mockConfigService.get('puppeteerFileGeneration').maxConcurrency;

      // Check that Cluster.launch was called with appropriate options
      expect(Cluster.launch).toHaveBeenCalledWith({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: maxConcurrency, // Based on the mockConfigService
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
    const mockBuffer = Buffer.from('mock pdf content');
    const mockResult = {
      code: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': mockBuffer.length,
      },
      buffer: mockBuffer,
    };

    it('should successfully generate PDF', async () => {
      await service.onModuleInit(uuid);
      cluster.execute.mockResolvedValueOnce(mockResult);

      const result = await service.generate(uuid, params);

      expect(result.code).toBe(200);
      expect(result.headers['Content-Type']).toBe('application/pdf');
      expect(result.buffer).toEqual(mockBuffer);
      expect(result.headers['Content-Length']).toBe(mockBuffer.length);

      // check that cluster has executed task
      expect(cluster.execute).toHaveBeenCalledWith(params, expect.any(Function));
    });

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

  // Tests to check cluster events
  describe('cluster events', () => {
    const uuid = 'cluster-event-uuid';

    it('should handle task error events and maintain cluster status', async () => {
      await service.onModuleInit(uuid);
      const mockError = new Error('Task execution error');
      const mockData = { task: 'someTask', attempts: 1 };

      const errorHandler = cluster.on.mock.calls.find((call) => call[0] === 'taskerror')[1]; // get error handller
      errorHandler(mockError, mockData, true); // mock error with retry

      expect(mockLoggingService.getLogger().warn).toHaveBeenCalledWith(
        { uuid },
        expect.stringContaining('Retrying... (Attempt 2)'),
      );
      // check cluster state
      expect(service['status']).toBe('active');
    });

    it('should log an error and set status to closed on non-retriable task error', async () => {
      await service.onModuleInit(uuid);
      const mockError = new Error('Task execution error');
      const mockData = { task: 'someTask', attempts: 3 }; // If maximum retry has been attempted

      const errorHandler = cluster.on.mock.calls.find((call) => call[0] === 'taskerror')[1];
      errorHandler(mockError, mockData, false);

      expect(mockLoggingService.getLogger().error).toHaveBeenCalledWith(
        { uuid },
        expect.stringContaining(`Failed to process ${JSON.stringify(mockData)}: ${mockError.message}`),
      );

      expect(service['status']).toBe('closed');
    });

    it('should keep status as closed after multiple errors', async () => {
      await service.onModuleInit(uuid);
      const mockError = new Error('Repeated task execution error');
      const mockData = { task: 'someTask', attempts: 3 };

      const errorHandler = cluster.on.mock.calls.find((call) => call[0] === 'taskerror')[1];
      errorHandler(mockError, mockData, false); // Mock error without retry

      expect(mockLoggingService.getLogger().error).toHaveBeenCalledWith(
        { uuid },
        expect.stringContaining(`Failed to process ${JSON.stringify(mockData)}: ${mockError.message}`),
      );

      expect(service['status']).toBe('closed');
    });
  });
});
