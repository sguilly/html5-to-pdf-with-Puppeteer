/* eslint-disable max-len */
import { Injectable, Logger } from '@nestjs/common';
import { Cluster } from 'puppeteer-cluster';
import { GenerateDocumentDto } from './dto/generate-pdf-dto';
import { ConvertTools } from './tools/convert-tool';
@Injectable()
export class GeneratePdfService {
  private cluster: Cluster<any>;
  readonly logger = new Logger(GeneratePdfService.name);

  constructor(private converTools: ConvertTools) {}

  async onModuleInit() {
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
          this.logger.warn(`Error while processing ${data}: ${err.message}. Retrying...`);
        } else {
          this.logger.error(`Failed to process ${data}: ${err.message}`);
        }
      });
    } catch (error) {
      this.logger.error('Failed to initialize Puppeteer cluster', error.stack);
      // Rethrow the error to ensure proper application behavior
      throw error;
    }
  }

  async generate(params: { format: string; url: string; waitFor?: string } | GenerateDocumentDto) {
    try {
      const task = async ({
        page,
        data,
      }: {
        page: any;
        data: { format: string; url: string; waitFor?: string } | GenerateDocumentDto;
      }) => {
        await page.setDefaultNavigationTimeout(15000);
        await page.emulateTimezone('Europe/Paris');

        await this.converTools.loadPage(page, data);
        await this.converTools.waitForImages(page);
        await this.converTools.setPageDimensions(page);

        let buffer: Buffer;
        let contentType: string;

        switch (data.format) {
          case 'pdf':
            buffer = await this.converTools.generatePdf(page, data);
            contentType = 'application/pdf';
            break;

          case 'image':
            buffer = await this.converTools.generateImage(page);
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

  async onModuleDestroy() {
    await this.cluster?.close();
  }
}
