import { Controller, Get, Headers, Param } from '@nestjs/common';
import { correlationId, LoggingService } from '@s3pweb/nestjs-common';
import { EntitiesService } from './utils/entities/entities.service';
import { Types } from 'mongoose';

@Controller()
export class AppController {
  private readonly log;

  constructor(
    logger: LoggingService,
    private readonly entitiesService: EntitiesService,
  ) {
    this.log = logger.getLogger(AppController.name);
  }

  @Get('entities/:id')
  async getEntity(@Headers(correlationId) uuid: string, @Param('id') id: string) {
    this.log.debug({ uuid }, `Get entity ${id} by ID.`);
    const mongoId = new Types.ObjectId(id);
    return this.entitiesService.getEntity(uuid, mongoId);
  }
}
