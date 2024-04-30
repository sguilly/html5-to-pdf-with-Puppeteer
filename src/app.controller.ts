import { Controller, Get, Headers, Param } from '@nestjs/common';
import { correlationId, LoggingService } from '@s3pweb/nestjs-common';
import { EntitiesService } from './entities/entities.service';
import { Types } from 'mongoose';
import { Entity } from './utils/models/entity.model';
import { ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Constants } from './utils/constants.utils';

@ApiTags('App Controller')
@Controller('api/v1')
export class AppController {
  private readonly log;

  constructor(
    logger: LoggingService,
    private readonly entitiesService: EntitiesService,
  ) {
    this.log = logger.getLogger(AppController.name);
  }

  @Get('entities/:id')
  @ApiHeader(Constants.correlationIdHeaderObj)
  @ApiOperation({
    summary: 'Get an entity by ID.',
    description: 'Route description',
  })
  @ApiParam({ name: 'id', description: 'Entity Id' })
  async getEntity(@Headers(correlationId) uuid: string, @Param('id') id: string): Promise<Entity> {
    this.log.debug({ uuid }, `Get entity ${id} by ID.`);
    const mongoId = new Types.ObjectId(id);
    return this.entitiesService.getEntity(uuid, mongoId);
  }
}
