import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@s3pweb/nestjs-common';
import { GeneratePdfService } from '../../src/generate-pdf/generate-pdf.service';
import { configMock } from '../../src/utils/mocks/config.mock.ts';

export const pdfBuffer: Buffer = Buffer.from('Generate Pdf Controller');
export function getSpecProvidersImport(useMockGeneratePdfService: boolean = true) {
  const mockLoggingService = {
    getLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = configMock();
      return config[key] || null;
    }),
  };

  const mockGeneratePdfService = {
    generate: jest.fn().mockResolvedValue({
      code: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,
      },
      buffer: pdfBuffer,
    }),
  };

  return [
    { provide: LoggingService, useValue: mockLoggingService },
    { provide: ConfigService, useValue: mockConfigService },
    {
      // If `useMockGeneratePdfService` is true, we use the mock, otherwise we use the original class.
      provide: GeneratePdfService,
      useClass: useMockGeneratePdfService ? jest.fn(() => mockGeneratePdfService) : GeneratePdfService,
      // `useClass` allows NestJS to automatically inject the necessary dependencies
    },
  ];
}
export { configMock };
