import { Controller, Get, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import { correlationId, LoggingService } from '@s3pweb/nestjs-common';

@Controller()
export class AppController {
  private readonly log;

  constructor(
    logger: LoggingService,
    private readonly appService: AppService,
  ) {
    this.log = logger.getLogger(AppController.name);
  }

  @Get()
  getHello(@Headers(correlationId) uuid: string): string {
    this.log.debug({ uuid }, 'Get hello');
    return this.appService.getHello();
  }
}
