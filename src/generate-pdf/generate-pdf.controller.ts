import { Body, Controller, Headers, InternalServerErrorException, Post, Res } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { correlationId, LoggingService, S3PLogger } from '@s3pweb/nestjs-common';
import { Response } from 'express';
import { GeneratePdfFromHtmlDto } from './dto/generate-pdf-html-dto';
import { GeneratePdfFromUrlDto } from './dto/generate-pdf-url-dto';
import { GeneratePdfService } from './generate-pdf.service';

interface GenerateResponse {
  headers: Record<string, string>;
  code: number;
  buffer: Buffer;
}
@ApiTags('generate')
@Controller('api/v2/generate-pdf')
export class GeneratePdfController {
  private readonly log: S3PLogger;
  constructor(
    private readonly generatePdfService: GeneratePdfService,
    logger: LoggingService,
  ) {
    this.log = logger.getLogger(GeneratePdfController.name);
  }

  // common log method
  private logRequest(uuid: string, endpoint: string, body: Record<string, any>, response?: GenerateResponse): void {
    this.log.info({ uuid }, `call ${endpoint} with data: ${JSON.stringify(body)}`);
    if (response) {
      this.log.info({ uuid }, 'Generated response: ' + JSON.stringify(response));
    }
  }

  @Post('url')
  @ApiBody({ type: GeneratePdfFromUrlDto })
  async generateFromUrlParams(
    @Body() body: GeneratePdfFromUrlDto,
    @Res() res: Response,
    @Headers(correlationId) uuid: string,
  ): Promise<void> {
    this.logRequest(uuid, 'api/v2/generate-pdf/url', body);
    const { url, format, waitFor } = body;

    try {
      const response = await this.generatePdfService.generate(uuid, { url, format, waitFor });
      this.logRequest(uuid, 'api/v2/generate-pdf/url', body, response);
      if (response.headers) {
        res.set(response.headers);
      }
      res.status(response.code).send(response.buffer);
    } catch (err) {
      this.log.error({ uuid }, 'Error occurred during document generation: ', err.stack);
      throw new InternalServerErrorException('Error : ' + err.message);
    }
  }

  @Post('html')
  @ApiBody({ type: GeneratePdfFromHtmlDto })
  async generateFromHtml(
    @Body() body: GeneratePdfFromHtmlDto,
    @Res() res: Response,
    @Headers(correlationId) uuid: string,
  ): Promise<void> {
    try {
      this.logRequest(uuid, 'api/v2/generate-pdf/html', body);
      const response = await this.generatePdfService.generate(uuid, body);
      this.logRequest(uuid, 'api/v2/generate-pdf/html', response);

      if (response.headers) {
        res.set(response.headers);
      }

      res.status(response.code).send(response.buffer);
    } catch (err) {
      this.log.error({ uuid }, 'Error occurred during document generation: ', err.stack);
      throw new InternalServerErrorException('Error : ' + err.message);
    }
  }
}
