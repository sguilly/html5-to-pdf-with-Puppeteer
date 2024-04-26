import { Test, TestingModule } from '@nestjs/testing';
import { PromService } from './prom.service';

describe(PromService.name, () => {
  let service: PromService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromService],
    }).compile();

    service = module.get<PromService>(PromService);
  });

  describe('metrics', () => {
    it('should be truthy', async () => {
      expect(service.requestDurationMs).toBeTruthy();
      expect(service.request).toBeTruthy();
    });
  });
});
