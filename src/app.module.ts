import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { RequestTrackerMiddleware } from './utils/middlewares/request-tracker.middleware';
import { LoggingModule } from '@s3pweb/nestjs-common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PromModule } from './prom/prom.module';
import { ConfigUtils } from './utils/config.utils';
import { MongooseModule } from '@nestjs/mongoose';
import { Constants } from './utils/constants.utils';
import { EntitiesModule } from './entities/entities.module';
import { APP_PIPE } from '@nestjs/core';

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
    EntitiesModule,
    PromModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      connectionName: Constants.resourceDb,
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongo.resourcesUri'),
        appName: 'base-api',
        compressors: ['zlib'],
      }),
    }),
  ],
  controllers: [AppController],
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
