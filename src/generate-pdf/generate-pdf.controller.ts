import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { correlationId, LoggingService, S3PLogger } from '@s3pweb/nestjs-common';
import { Response } from 'express';
import { GeneratePdfFromHtmlDto } from './dto/generate-pdf-html-dto';
import { GeneratePdfFromUrlDto } from './dto/generate-pdf-url-dto';
import { GeneratePdfService } from './generate-pdf.service';

@ApiTags('generate')
@Controller('v2/generate-pdf')
export class GeneratePdfController {
  private readonly log: S3PLogger;
  constructor(
    private readonly generatePdfService: GeneratePdfService,
    logger: LoggingService,
  ) {
    this.log = logger.getLogger(GeneratePdfController.name);
  }

  @Post('url')
  @ApiBody({ type: GeneratePdfFromUrlDto })
  async generateFromUrlParams(
    @Body() body: GeneratePdfFromUrlDto,
    @Res() res: Response,
    @Headers(correlationId) uuid: string,
  ): Promise<void> {
    this.log.info({ uuid }, 'call /v2/generate-pdf/url with data ' + JSON.stringify(body));
    const { url, format, waitFor } = body;

    if (!url || !format) {
      this.log.warn({ uuid }, 'Invalid format value');
      throw new BadRequestException(
        'Please specify a format and a url like this: ?format=image&url=https://example.com',
      );
    }

    try {
      this.log.info({ uuid }, 'Generating PDF from URL with data: ' + JSON.stringify(body));
      const response = await this.generatePdfService.generate(uuid, { url, format, waitFor });
      this.log.info({ uuid }, 'Generated response: ' + JSON.stringify(response));

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
      this.log.info({ uuid }, 'call /v2/generate-pdf/html with data' + JSON.stringify(body));

      if (!['image', 'pdf'].includes(body.format)) {
        this.log.warn({ uuid }, 'Invalid format value');
        throw new BadRequestException('Invalid format.');
      }

      const response = await this.generatePdfService.generate(uuid, body);
      this.log.info({ uuid }, 'Generated response: ' + JSON.stringify(response));

      if (response.headers) {
        res.set(response.headers);
      }
      res.status(response.code).send(response.buffer);
    } catch (err) {
      this.log.error({ uuid }, 'Error occurred during document generation: ', err.stack);

      if (err instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send('Bad request: ' + err.message);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error.');
      }
    }
  }
}
