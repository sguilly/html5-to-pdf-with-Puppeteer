import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@s3pweb/nestjs-common';
import { validate } from 'class-validator';
import { Response } from 'express';
import { GeneratePdfFromHtmlDto } from './dto/generate-pdf-html-dto';
import { GeneratePdfFromUrlDto } from './dto/generate-pdf-url-dto';
import { GeneratePdfController } from './generate-pdf.controller';
import { GeneratePdfService } from './generate-pdf.service';

describe('GeneratePdfController', () => {
  let controller: GeneratePdfController;
  //let service: GeneratePdfService;
  const buffer: Buffer = Buffer.from('Generate Pdf Controller');
  const contentType: string = 'application/pdf';

  const mockLoggingService = {
    getLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
  };

  const mockGeneratePdfService = {
    generate: jest.fn().mockResolvedValue({
      code: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length,
      },
      buffer,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneratePdfController],
      providers: [
        ConfigService,
        { provide: GeneratePdfService, useValue: mockGeneratePdfService },
        {
          provide: LoggingService, // Mocker LoggingService
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    controller = module.get<GeneratePdfController>(GeneratePdfController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('generateFromUrlParam', () => {
    const uuid = 'generateFromUrlParams';
    it('should generate pdf from url', async () => {
      // Créez un mock de la réponse
      const res = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const body: GeneratePdfFromUrlDto = { url: 'https://example.com', format: 'image', waitFor: 'networked0' };

      await controller.generateFromUrlParams(body, res, uuid);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': contentType,
        'Content-Length': buffer.length,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(buffer);
    });
    it('should throw errors for invalid data', async () => {
      const dto = new GeneratePdfFromUrlDto();
      dto.url = '';
      dto.format = '';
      dto.waitFor = 'networkidle0';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints.isNotEmpty).toBeDefined();
    });
  });
  describe('generateFromHtml', () => {
    const uuid = 'generateFromHtml';

    it('should generate pdf from html', async () => {
      const body = { html: '<html></html>', format: 'pdf' };

      const res = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.generateFromHtml(body, res, uuid);

      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': contentType,
        'Content-Length': buffer.length,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(buffer);
    });

    it('should throw errors for invalid data', async () => {
      const dto = new GeneratePdfFromHtmlDto();
      dto.html = '';
      dto.format = '';
      dto.waitFor = 'networkidle0';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints.isNotEmpty).toBeDefined();
    });
  });
});
