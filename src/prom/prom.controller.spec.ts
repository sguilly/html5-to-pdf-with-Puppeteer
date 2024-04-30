import { Test, TestingModule } from '@nestjs/testing';
import * as promClient from 'prom-client';
import { PromController } from './prom.controller';

describe('Prom Controller', () => {
  let controller: PromController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromController],
    }).compile();

    controller = module.get<PromController>(PromController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMetrics', () => {
    it('should return nothing', async () => {
      jest.spyOn(promClient.register, 'metrics').mockImplementation((): any => Promise.resolve(''));
      expect(await controller.getMetrics()).toStrictEqual('');
    });
  });
});
