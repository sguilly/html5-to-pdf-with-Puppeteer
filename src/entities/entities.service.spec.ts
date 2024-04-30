import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesService } from './entities.service';
import { execLeanPromise, MockMongooseModel, mongooseMock } from '../utils/mocks/mockMongooseModel';
import { Constants } from '../utils/constants.utils';
import { Types } from 'mongoose';
import { commonProvidersMock } from '../utils/mocks/commonProviders.mock';
import { Entity } from '../utils/models/entity.model';

describe(EntitiesService.name, () => {
  let service: EntitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [...commonProvidersMock, EntitiesService, MockMongooseModel(Entity.name, Constants.resourceDb)],
    }).compile();

    service = module.get<EntitiesService>(EntitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const entityId = new Types.ObjectId('5ac3788a93b8f33d12c35253');

  const entity: Entity = {
    _id: entityId,
    name: 'S3PWEB',
    mainStructureId: new Types.ObjectId('5b0fe2abb460bd24abe32654'),
    identity: 'transporter',
  };

  describe('getEntity', () => {
    it('should not fail', async () => {
      mongooseMock.findById = jest.fn().mockImplementationOnce(() => execLeanPromise(entity));
      await expect(service.getEntity('uuid', entityId)).resolves.toEqual(entity);
    });
  });
});
