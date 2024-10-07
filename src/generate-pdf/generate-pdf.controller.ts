import { Body, Controller, Headers, InternalServerErrorException, Post, Res } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { correlationId, LoggingService, S3PLogger } from '@s3pweb/nestjs-common';
import { Response } from 'express';
import { Constants } from '../utils/constants.utils';
import { GenerateResponse } from '../utils/types/generate-response.type';
import { GeneratePdfFromHtmlDto } from './dto/generate-pdf-html-dto';
import { GeneratePdfFromUrlDto } from './dto/generate-pdf-url-dto';
import { GeneratePdfService } from './generate-pdf.service';

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

  /**
   * generatePdfService will return a buffer that we must process with express res prop if not nest will return a json that we must convert
   *  @Res - Express response object to send back the PDF file
   *  @set - res.set() allow to define HTTP response header
   * @status - res.status set a response code (e.g. 201) to indicate that the pdf has been generated successfully
   * @send - res.send after has been define headers and code status controller ll use it to send PDF to client
   */

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

  // common log method
  private logRequest(uuid: string, endpoint: string, body: Record<string, any>, response?: GenerateResponse): void {
    const MAX_BODY_LENGTH = 1000;
    const bodyToLog =
      JSON.stringify(body).substring(0, MAX_BODY_LENGTH) + (JSON.stringify(body).length > MAX_BODY_LENGTH ? '...' : '');
    this.log.info({ uuid }, `call ${endpoint} with data: ${bodyToLog}`);
    if (response) {
      this.log.info({ uuid }, 'Generated response: ' + JSON.stringify(response));
    }
  }
}
