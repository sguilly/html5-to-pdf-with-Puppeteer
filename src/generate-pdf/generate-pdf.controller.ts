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
import { correlationId, LoggingService } from '@s3pweb/nestjs-common';
import { validateOrReject } from 'class-validator';
import { Response } from 'express';
import { GeneratePdfFromHtmlDto } from './dto/generate-pdf-html-dto';
import { GeneratePdfFromUrlDto } from './dto/generate-pdf-url-dto';
import { GeneratePdfService } from './generate-pdf.service';

@ApiTags('generate')
@Controller('v2/generate-pdf')
export class GeneratePdfController {
  constructor(
    private readonly generatePdfService: GeneratePdfService,
    private readonly logger: LoggingService,
  ) {}

  @Post('url')
  @ApiBody({ type: GeneratePdfFromUrlDto })
  async generateFromUrlParams(
    @Body()
    body: GeneratePdfFromUrlDto,
    @Res() res: Response,
    @Headers(correlationId) uuid: string,
  ): Promise<void> {
    const { url, format, waitFor } = body;

    if (!url || !format) {
      this.logger.warn({ uuid }, 'Invalid format value');
      throw new BadRequestException(
        'Please specify a format and a url like this: ?format=image&url=https://example.com',
      );
    }

    try {
      const response = await this.generatePdfService.generate({ url, format, waitFor });

      res.set(response.headers);
      res.status(response.code).send(response.buffer);
    } catch (err) {
      this.logger.error({ uuid }, 'Error occurred during document generation: ', err.stack);
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
      await validateOrReject(body);

      if (!['image', 'pdf'].includes(body.format)) {
        this.logger.warn({ uuid }, 'Invalid format value');
        throw new BadRequestException('Invalid format.');
      }

      const response = await this.generatePdfService.generate(body);

      res.set(response.headers);
      res.status(response.code).send(response.buffer);
    } catch (err) {
      this.logger.error({ uuid }, 'Error occurred during document generation: ', err.stack);

      if (err instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send('Bad request: ' + err.message);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error.');
      }
    }
  }
}
