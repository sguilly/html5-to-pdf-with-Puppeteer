/* eslint-disable max-len */
import { Injectable } from '@nestjs/common';
import { LoggingService, S3PLogger } from '@s3pweb/nestjs-common';
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
  private readonly log: S3PLogger;

  constructor(logger: LoggingService) {
    this.log = logger.getLogger(GeneratePdfService.name);
  }

  async onModuleInit(uuid: string): Promise<void> {
    try {
      // Cluster init, it's used by puppeteer library to handle many files or document in same time
      this.cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 10,
        puppeteerOptions: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        },
      });

      // handle error on tasks execution
      this.cluster.on('taskerror', (err, data, willRetry) => {
        if (willRetry) {
          this.log.warn({ uuid }, `Error while processing ${data}: ${err.message}. Retrying...`);
        } else {
          this.log.error({ uuid }, `Failed to process ${data}: ${err.message}`);
        }
      });
    } catch (error) {
      this.log.error({ uuid }, 'Failed to initialize Puppeteer cluster', error.stack);
      // Rethrow the error to ensure proper application behavior
      throw error;
    }
  }

  async generate(uuid: string, params: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto): Promise<GenerateResponse> {
    try {
      // setting task to execute by puppeteer
      const task = async ({ page, data }: { page: Page; data: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto }) => {
        this.log.info({ uuid }, 'set and execute task for cluster');

        page.setDefaultNavigationTimeout(15000);
        await page.emulateTimezone('Europe/Paris');

        await ConvertTools.loadPage(page, data);
        await ConvertTools.waitForImages(page);
        await ConvertTools.setPageDimensions(page);

        let buffer: Buffer;
        let contentType: string;

        // file generate based type ask (PDF or Image)
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

      // execute tasks ,with Puppeteer using the cluster
      return await this.cluster.execute(params, task);
    } catch (error) {
      this.log.error({ uuid }, 'Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }

  async onModuleDestroy(uuid: string): Promise<void> {
    this.log.info({ uuid }, 'closing cluster');
    await this.cluster?.close();
  }
}
