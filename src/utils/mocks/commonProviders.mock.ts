import { configMock } from '@s3pweb/nestjs-common/dist/logging/mock/config.mock';
import { LoggingService, METRICS_SERVICE } from '@s3pweb/nestjs-common';
import { PromServiceMock } from './prom-service.mock';
import { ConfigService } from '@nestjs/config';
import { Constants } from '../constants.utils';
import { MockMongooseModel } from './mockMongooseModel';
import { Entity } from '../models/entity.model';

export const commonProvidersMock = [
  {
    provide: 'LOGGING_CONFIG',
    useValue: configMock,
  },
  {
    provide: METRICS_SERVICE,
    useValue: new PromServiceMock(),
  },
  LoggingService,
  {
    provide: ConfigService,
    useValue: {
      get: jest.fn((key: string) => {
        if (key === 'key from the config') {
          return 'value to mock';
        }
        return null;
      }),
    },
  },
  MockMongooseModel(Entity.name, Constants.resourceDb),
];
