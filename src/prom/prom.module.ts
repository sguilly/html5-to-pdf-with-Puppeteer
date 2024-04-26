import { Global, Module } from '@nestjs/common';
import { PromController } from './prom.controller';
import { PromService } from './prom.service';
import { METRICS_SERVICE } from '@s3pweb/nestjs-common';

@Global()
@Module({
  providers: [
    {
      provide: METRICS_SERVICE,
      useClass: PromService,
    },
  ],
  controllers: [PromController],
  exports: [
    {
      provide: METRICS_SERVICE,
      useClass: PromService,
    },
  ],
})
export class PromModule {
  // -- Empty
}
