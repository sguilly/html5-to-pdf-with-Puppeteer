/* eslint-disable max-len */
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  private cluster: Cluster<GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto>;
  private readonly log: S3PLogger;
  private status: 'initializing' | 'active' | 'closing' | 'closed' = 'initializing'; // cluster state
  private maxRetries: number = 2;

  constructor(
    logger: LoggingService,
    private configService: ConfigService,
  ) {
    this.log = logger.getLogger(GeneratePdfService.name);
  }

  async onModuleInit(uuid: string): Promise<void> {
    try {
      const maxConcurrency = this.configService.get<number>('maxConcurrency');

      if (typeof maxConcurrency !== 'number' || isNaN(maxConcurrency)) {
        throw new BadRequestException('maxConcurrency must be a number');
      }
      // Cluster init, it's used by puppeteer library to handle many files or documents in same time
      this.cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: maxConcurrency,
        puppeteerOptions: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        },
      });
      this.status = 'active'; // Update cluster state
      this.log.info({ uuid }, 'Cluster initialized successfully');

      // handle error on tasks execution
      this.cluster.on('taskerror', (err, data, willRetry) => {
        const attemptCount = data.attempts || 0;

        if (willRetry) {
          if (attemptCount < this.maxRetries) {
            data.attempts = attemptCount + 1;
            this.log.warn(
              { uuid },
              `Error while processing ${data}: ${err.message}. Retrying... (Attempt ${data.attempts})`,
            );
          } else {
            this.log.error({ uuid }, `Exceeded maximum retries for ${data}: ${err.message}`);
          }
        } else {
          this.log.error({ uuid }, `Failed to process ${data}: ${err.message}`);
        }
      });
    } catch (error) {
      this.log.error({ uuid }, 'Failed to initialize Puppeteer cluster', error.stack);
      this.status = 'closed';
      // Rethrow the error to ensure proper application behavior
      throw error;
    }
  }

  async generate(uuid: string, params: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto): Promise<GenerateResponse> {
    try {
      //check if cluster is actif before starting
      if (this.status !== 'active') {
        throw new Error('Cluster is not active');
      }

      // setting task to execute by puppeteer
      const task = async ({ page, data }: { page: Page; data: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto }) => {
        this.log.info({ uuid }, 'set and execute task for cluster');

        page.setDefaultNavigationTimeout(15000);
        await page.emulateTimezone('Europe/Paris');

        // Load page based on URL or HTML content
        try {
          await ConvertTools.loadPage(page, data);
        } catch (error) {
          this.log.error({ uuid }, `Failed to load page: ${error.message}`);
          throw new Error('Page load failed. Check if the URL is valid or if the HTML content is correct.');
        }

        // Wait for images on the page
        try {
          await ConvertTools.waitForImages(page);
        } catch (error) {
          this.log.error({ uuid }, `Failed to load images: ${error.message}`);
          throw new Error('Image loading failed. Some images may not have loaded properly on the page.');
        }

        // Set page dimensions based on content
        try {
          await ConvertTools.setPageDimensions(page);
        } catch (error) {
          this.log.error({ uuid }, `Failed to set page dimensions: ${error.message}`);
          throw new Error('Error in setting page dimensions.');
        }

        let buffer: Buffer;
        let contentType: string;

        // Process based on the requested format
        try {
          ({ buffer, contentType } = await this.processFormat(page, data));
        } catch (error) {
          this.log.error({ uuid }, `Format processing failed: ${error.message}`);
          throw new Error('Failed to process format. Ensure that the format is valid (pdf or image).');
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
      this.log.error({ uuid }, `Error generating content: ${error.message}`);
      throw new InternalServerErrorException(`Error generating PDF or Image: ${error.message}`);
    }
  }

  // handle different formats
  private async processFormat(
    page: Page,
    data: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    switch (data.format) {
      case 'pdf':
        return await this.generatePdfContent(page, data);

      case 'image':
        return await this.generateImageContent(page);

      default:
        throw new BadRequestException('Unsupported format. Please use either pdf or image.');
    }
  }

  // generate PDF
  private async generatePdfContent(
    page: Page,
    data: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const pdfBuffer = await ConvertTools.generatePdf(page, data);
    const buffer = Buffer.from(pdfBuffer); // Convert Uint8Array to Buffer
    return { buffer, contentType: 'application/pdf' };
  }

  // generate Image
  private async generateImageContent(page: Page): Promise<{ buffer: Buffer; contentType: string }> {
    const imageBuffer = await ConvertTools.generateImage(page);
    const buffer = Buffer.from(imageBuffer); // Convert Uint8Array to Buffer
    return { buffer, contentType: 'image/jpg' };
  }

  // close cluster
  async onModuleDestroy(uuid: string): Promise<void> {
    this.log.info({ uuid }, 'Attempting to close cluster');
    if (this.cluster) {
      this.status = 'closing';
      await this.cluster.close();
      this.status = 'closed';
      this.log.info({ uuid }, 'Cluster closed successfully');
    } else {
      this.log.warn({ uuid }, 'Cluster instance was not initialized');
    }
  }
}
