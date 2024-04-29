import { Injectable } from '@nestjs/common';
import { LoggingService } from '@s3pweb/nestjs-common';
import { InjectModel } from '@nestjs/mongoose';
import { Constants } from '../constants.utils';
import { Model, Types } from 'mongoose';
import { Entity, EntityDocument } from '../models/entity.model';

@Injectable()
export class EntitiesService {
  private readonly log;

  constructor(
    logger: LoggingService,
    @InjectModel(Entity.name, Constants.resourceDb)
    private readonly entity: Model<EntityDocument>,
  ) {
    this.log = logger.getLogger(EntitiesService.name);
  }

  async getEntity(uuid: string, entityId: Types.ObjectId): Promise<Entity> {
    this.log.trace({ uuid }, `Get entity ${entityId?.toString()}.`);
    return this.entity.findById(entityId).lean().exec();
  }
}
