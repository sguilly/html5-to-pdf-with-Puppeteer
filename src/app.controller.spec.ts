import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { commonProvidersMock } from './utils/mocks/commonProviders.mock';
import { EntitiesService } from './entities/entities.service';
import { Types } from 'mongoose';
import { Entity } from './utils/models/entity.model';

describe(AppController.name, () => {
  let appController: AppController;
  let entitiesService: EntitiesService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [...commonProvidersMock, EntitiesService],
    }).compile();

    appController = app.get<AppController>(AppController);
    entitiesService = app.get<EntitiesService>(EntitiesService);
  });

  describe('getEntity', () => {
    const entity: Entity = {
      _id: new Types.ObjectId('5ac3788a93b8f33d12c35253'),
      name: 'S3PWEB',
      mainStructureId: new Types.ObjectId('5b0fe2abb460bd24abe32654'),
      identity: 'transporter',
    };

    it('should return an entity', () => {
      jest.spyOn(entitiesService, 'getEntity').mockResolvedValueOnce(entity);

      expect(appController.getEntity('uuid', '5ac3788a93b8f33d12c35253')).resolves.toEqual({
        _id: new Types.ObjectId('5ac3788a93b8f33d12c35253'),
        name: 'S3PWEB',
        mainStructureId: new Types.ObjectId('5b0fe2abb460bd24abe32654'),
        identity: 'transporter',
      });
    });
  });
});
