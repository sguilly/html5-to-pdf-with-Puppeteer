import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { LoggingModule } from '@s3pweb/nestjs-common';
import { GeneratePdfModule } from './generate-pdf/generate-pdf.module';
import { PromModule } from './prom/prom.module';
import { ConfigUtils } from './utils/config.utils';
import { RequestTrackerMiddleware } from './utils/middlewares/request-tracker.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ConfigUtils.getConfig],
    }),
    LoggingModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return configService.get('logger');
      },
      inject: [ConfigService],
    }),
    PromModule,
    GeneratePdfModule,
  ],
  providers: [
    {
      // For every single request coming to the application, apply the validation pipe
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true, whitelist: true, skipMissingProperties: false }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestTrackerMiddleware).forRoutes('*');
  }
}
