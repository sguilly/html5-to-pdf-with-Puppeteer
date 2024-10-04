import { Injectable } from '@nestjs/common';
import { LoggingService, S3PLogger } from '@s3pweb/nestjs-common';
import { GenerateResponse } from '../utils/types/generate-response.type';

@Injectable()
export abstract class BaseService {
  protected readonly log: S3PLogger;

  constructor(logger: LoggingService) {
    this.log = logger.getLogger(BaseService.name);
  }

  protected logRequest(uuid: string, endpoint: string, body: Record<string, any>, response?: GenerateResponse): void {
    this.log.info({ uuid }, `call ${endpoint} with data: ${JSON.stringify(body)}`);
    if (response) {
      this.log.info({ uuid }, 'Generated response: ' + JSON.stringify(response));
    }
  }
}
