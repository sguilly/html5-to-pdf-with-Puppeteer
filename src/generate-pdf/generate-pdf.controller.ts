import { Body, Controller, Headers, InternalServerErrorException, Post, Res } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { correlationId, LoggingService } from '@s3pweb/nestjs-common';
import { Response } from 'express';
import { BaseService } from '../utils/base-service.utils';
import { Constants } from '../utils/constants.utils';
import { GeneratePdfFromHtmlDto } from './dto/generate-pdf-html-dto';
import { GeneratePdfFromUrlDto } from './dto/generate-pdf-url-dto';
import { GeneratePdfService } from './generate-pdf.service';

@ApiTags('generate')
@Controller('api/v2/generate-pdf')
export class GeneratePdfController extends BaseService {
  constructor(
    private readonly generatePdfService: GeneratePdfService,
    logger: LoggingService,
  ) {
    super(logger);
  }

  @Post('url')
  @ApiHeader(Constants.correlationIdHeaderObj)
  @ApiBody({ type: GeneratePdfFromUrlDto })
  async generateFromUrlParams(
    @Body() body: GeneratePdfFromUrlDto,
    @Res() res: Response, // Express response object to send back the PDF file
    @Headers(correlationId) uuid: string,
  ): Promise<void> {
    this.logRequest(uuid, 'api/v2/generate-pdf/url', body);
    const { url, format, waitFor } = body;

    try {
      const response = await this.generatePdfService.generate(uuid, { url, format, waitFor });
      this.logRequest(uuid, 'api/v2/generate-pdf/url', body, response);
      // If the service returned headers
      if (response.headers) {
        // set  headers   HTTP response
        res.set(response.headers);
      }
      // Set the response status code and send the PDF buffer as the response body
      res.status(response.code).send(response.buffer);
    } catch (err) {
      this.log.error({ uuid }, 'Error occurred during document generation: ', err.stack);
      throw new InternalServerErrorException('Error : ' + err.message);
    }
  }

  @Post('html')
  @ApiHeader(Constants.correlationIdHeaderObj)
  @ApiBody({ type: GeneratePdfFromHtmlDto })
  async generateFromHtml(
    @Body() body: GeneratePdfFromHtmlDto,
    @Res() res: Response, // Express response object to send back the PDF file
    @Headers(correlationId) uuid: string,
  ): Promise<void> {
    try {
      this.logRequest(uuid, 'api/v2/generate-pdf/html', body);
      const response = await this.generatePdfService.generate(uuid, body);
      this.logRequest(uuid, 'api/v2/generate-pdf/html', response);
      // If the service returned headers
      if (response.headers) {
        // set  headers   HTTP response
        res.set(response.headers);
      }
      // Set the response status code and send the PDF buffer as the response body
      res.status(response.code).send(response.buffer);
    } catch (err) {
      this.log.error({ uuid }, 'Error occurred during document generation: ', err.stack);
      throw new InternalServerErrorException('Error : ' + err.message);
    }
  }
}
