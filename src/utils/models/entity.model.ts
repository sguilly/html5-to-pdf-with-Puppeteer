import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type EntityDocument = HydratedDocument<Entity>;

@Schema({
  collection: 'entities',
  timestamps: { createdAt: 'creationDate', updatedAt: 'lastModificationDate' },
  strictQuery: 'throw',
})
export class Entity {
  _id?: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  mainStructureId: Types.ObjectId;

  @Prop()
  identity: string;
}

export const EntitySchema = SchemaFactory.createForClass(Entity);
