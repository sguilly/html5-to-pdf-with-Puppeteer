import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LoggingService } from '@s3pweb/nestjs-common';
import { validateOrReject } from 'class-validator';
import { Response } from 'express';
import { GenerateDocumentDto } from './dto/generate-pdf-dto';
import { GeneratePdfService } from './generate-pdf.service';

@ApiTags('generate')
@Controller('generate-pdf')
export class GeneratePdfController {
  constructor(
    private readonly generatePdfService: GeneratePdfService,
    private readonly logger: LoggingService,
  ) {}

  @Get()
  @ApiQuery({ name: 'format', required: true, description: 'Image or pdf' })
  @ApiQuery({ name: 'url', required: true, description: 'Url of the page' })
  @ApiQuery({ name: 'waitFor', required: false, description: 'Wait for this id css' })
  async generateFromUrlParams(@Query() query: { format: string; url: string; waitFor?: string }, @Res() res: Response) {
    const { url, format, waitFor } = query;

    if (!url || !format) {
      this.logger.warn('Invalid format value');
      throw new BadRequestException(
        'Please specify a format and a url like this: ?format=image&url=https://example.com',
      );
    }

    try {
      const response = await this.generatePdfService.generate({ url, format, waitFor });

      res.set(response.headers);
      res.status(response.code).send(response.buffer);
    } catch (err) {
      this.logger.error('Error occurred during document generation: ', err.stack);
      throw new InternalServerErrorException('Error : ' + err.message);
    }
  }

  @Post()
  @ApiBody({ type: GenerateDocumentDto })
  async generateFromHtml(@Body() body: GenerateDocumentDto, @Res() res: Response) {
    try {
      await validateOrReject(body);

      if (!['image', 'pdf'].includes(body.format)) {
        this.logger.warn('Invalid format value');
        throw new BadRequestException('Invalid format.');
      }

      const response = await this.generatePdfService.generate(body);

      res.set(response.headers);
      res.status(response.code).send(response.buffer);
    } catch (err) {
      this.logger.error('Error occurred during document generation: ', err.stack);

      if (err instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send('Bad request: ' + err.message);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error.');
      }
    }
  }
}
