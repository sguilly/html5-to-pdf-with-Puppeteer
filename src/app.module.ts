import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestTrackerMiddleware } from './utils/middlewares/request-tracker.middleware';
import { LoggingModule } from '@s3pweb/nestjs-common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PromModule } from './prom/prom.module';
import { ConfigUtils } from './utils/config.utils';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestTrackerMiddleware).forRoutes('*');
  }
}
