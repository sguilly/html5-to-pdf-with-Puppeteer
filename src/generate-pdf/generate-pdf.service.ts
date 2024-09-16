/* eslint-disable max-len */
import { Injectable, Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import { ConvertTools } from '../utils/tools/convert-tool';
import { GeneratePdfFromHtmlDto } from './dto/generate-pdf-html-dto';
import { GeneratePdfFromUrlDto } from './dto/generate-pdf-url-dto';

interface GenerateResponse {
  headers: Record<string, string>;
  code: number;
  buffer: Buffer;
}
@Injectable()
export class GeneratePdfService {
  private cluster: Cluster<any>;
  readonly logger = new Logger(GeneratePdfService.name);

  constructor() {}

  async onModuleInit(uuid: string): Promise<void> {
    try {
      this.cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 10,
        puppeteerOptions: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        },
      });

      this.cluster.on('taskerror', (err, data, willRetry) => {
        if (willRetry) {
          this.logger.warn({ uuid }, `Error while processing ${data}: ${err.message}. Retrying...`);
        } else {
          this.logger.error({ uuid }, `Failed to process ${data}: ${err.message}`);
        }
      });
    } catch (error) {
      this.logger.error({ uuid }, 'Failed to initialize Puppeteer cluster', error.stack);
      // Rethrow the error to ensure proper application behavior
      throw error;
    }
  }

  async generate(params: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto): Promise<GenerateResponse> {
    try {
      const task = async ({ page, data }: { page: Page; data: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto }) => {
        await page.setDefaultNavigationTimeout(15000);
        await page.emulateTimezone('Europe/Paris');

        await ConvertTools.loadPage(page, data);
        await ConvertTools.waitForImages(page);
        await ConvertTools.setPageDimensions(page);

        let buffer: Buffer;
        let contentType: string;

        // switch (data.format) {
        //   case 'pdf':
        //     buffer = await ConvertTools.generatePdf(page, data);
        //     contentType = 'application/pdf';
        //     break;

        //   case 'image':
        //     buffer = await ConvertTools.generateImage(page);
        //     contentType = 'image/jpg';
        //     break;

        //   default:
        //     return { code: 400 };
        // }

        switch (data.format) {
          case 'pdf':
            const pdfBuffer = await ConvertTools.generatePdf(page, data);
            buffer = Buffer.from(pdfBuffer); // Convert Uint8Array to Buffer here
            contentType = 'application/pdf';
            break;

          case 'image':
            const imageBuffer = await ConvertTools.generateImage(page);
            buffer = Buffer.from(imageBuffer); // Convert Uint8Array to Buffer here
            contentType = 'image/jpg';
            break;

          default:
            return { code: 400 };
        }

        return {
          code: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': buffer.length,
          },
          buffer,
        };
      };

      return await this.cluster.execute(params, task);
    } catch (error) {
      this.logger.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.cluster?.close();
  }
}
