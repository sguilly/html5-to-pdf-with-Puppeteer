import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorrelationIdMiddleware, HttpExceptionsLoggerFilter, LoggingService } from '@s3pweb/nestjs-common';
import helmet from 'helmet';
import { Constants } from './utils/constants.utils';
import compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use our logger for all Nest logs
  const logger = await app.resolve(LoggingService);
  app.useLogger(logger);
  // Add custom filter to log all http errors
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionsLoggerFilter(logger, httpAdapter));

  if (Constants.convertConfigToBoolean(process.env.COMPRESSION)) {
    app.use(compression());
  }

  // FOR DEBUG ONLY
  // Logs all the mongoose queries to check filters
  // mongoose.set('debug', true);

  // Helmet middleware
  app.use(helmet());
  // Tracking ID
  app.use(CorrelationIdMiddleware());

  if (Constants.convertConfigToBoolean(process.env.SWAGGER)) {
    // Swagger configuration
    const options = new DocumentBuilder()
      .setTitle('S3PWeb / Base API')
      .setVersion('v1')
      // Set security
      //.addApiKey({ name: 'token', type: 'apiKey' }, 'token')
      //.addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('explorer', app, document);
  }

  await app.listen(3000);
}

bootstrap();
