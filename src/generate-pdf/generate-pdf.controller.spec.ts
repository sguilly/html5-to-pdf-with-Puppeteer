import { Test, TestingModule } from '@nestjs/testing';
//import { LoggingService } from '@s3pweb/nestjs-common';
import { validate } from 'class-validator';
import { Response } from 'express';
import { getSpecProvidersImport, pdfBuffer } from '../../test/util/providers.utils';
import { GeneratePdfFromHtmlDto } from './dto/generate-pdf-html-dto';
import { GeneratePdfFromUrlDto } from './dto/generate-pdf-url-dto';
import { GeneratePdfController } from './generate-pdf.controller';
//import { GeneratePdfService } from './generate-pdf.service';

describe('GeneratePdfController', () => {
  let controller: GeneratePdfController;
  //const buffer: Buffer = Buffer.from('Generate Pdf Controller');
  const contentType: string = 'application/pdf';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneratePdfController],
      providers: [
        //{ provide: GeneratePdfService, useValue: mockGeneratePdfService },
        ...getSpecProvidersImport(true), // add mutual providers with context
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
      // mock response
      const res = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      // networkidle0 is a function used to wait until there are no more than 0 network connections for at least 500 milliseconds.
      // @see https://www.webshare.io/academy-article/puppeteer-networkidle0-vs-networkidle2

      const body: GeneratePdfFromUrlDto = { url: 'https://example.com', format: 'image', waitFor: 'networkidle0' };

      await controller.generateFromUrlParams(body, res, uuid);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': contentType,
        'Content-Length': pdfBuffer.length,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(pdfBuffer);
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
        'Content-Length': pdfBuffer.length,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(pdfBuffer);
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
