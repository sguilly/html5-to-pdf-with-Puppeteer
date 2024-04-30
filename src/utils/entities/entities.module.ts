import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Constants } from '../constants.utils';
import { Entity, EntitySchema } from '../models/entity.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: Entity.name, schema: EntitySchema }], Constants.resourceDb)],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {
  // -- Empty
}
