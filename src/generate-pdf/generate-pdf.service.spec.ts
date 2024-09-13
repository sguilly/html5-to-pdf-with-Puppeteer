import { Test, TestingModule } from '@nestjs/testing';
import { GeneratePdfService } from './generate-pdf.service';
import { ConvertTools } from './tools/convert-tool';

// Mock de puppeteer-cluster
jest.mock('puppeteer-cluster', () => ({
  Cluster: {
    launch: jest.fn(),
    CONCURRENCY_CONTEXT: 'CONCURRENCY_CONTEXT',
  },
}));

describe('GeneratePdfService', () => {
  let service: GeneratePdfService;
  let convertToolsMock: ConvertTools;
  //let clusterMock: any;

  beforeEach(async () => {
    // Mock des méthodes de ConvertTools
    convertToolsMock = {
      loadPage: jest.fn(),
      waitForImages: jest.fn(),
      setPageDimensions: jest.fn(),
      generatePdf: jest.fn().mockResolvedValue(Buffer.from('PDF content')),
      generateImage: jest.fn().mockResolvedValue(Buffer.from('Image content')),
    } as any;

    // Mock du cluster avec la méthode execute
    // clusterMock = {
    //   execute: jest.fn().mockImplementation(async (data, task) => {
    //     const pageMock = {}; // Simuler une page vide
    //     await task({ page: pageMock, data });
    //   }),
    //   close: jest.fn(),
    //   on: jest.fn(),
    // };

    // Mock de Cluster.launch pour retourner le clusterMock
    // (Cluster.launch as jest.Mock).mockResolvedValue(clusterMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneratePdfService, { provide: ConvertTools, useValue: convertToolsMock }],
    }).compile();

    service = module.get<GeneratePdfService>(GeneratePdfService);
  });

  it('should call ConvertTools methods in generate()', async () => {
    const params = { format: 'pdf', url: 'http://example.com' };

    // Appel de la méthode generate
    await service.generate(params);

    // Vérifier que les méthodes de ConvertTools ont bien été appelées
    expect(convertToolsMock.loadPage).toHaveBeenCalledWith({}, params);
    expect(convertToolsMock.waitForImages).toHaveBeenCalledWith({});
    expect(convertToolsMock.setPageDimensions).toHaveBeenCalledWith({});
  });
});
