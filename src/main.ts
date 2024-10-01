import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorrelationIdMiddleware, HttpExceptionsLoggerFilter, LoggingService } from '@s3pweb/nestjs-common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Constants } from './utils/constants.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use our logger for all Nest logs
  const logger = await app.resolve(LoggingService);
  app.useLogger(logger);
  // Add custom filter to log all http errors
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionsLoggerFilter(logger, httpAdapter));

  // Helmet middleware
  app.use(helmet());
  // Tracking ID
  app.use(CorrelationIdMiddleware());

  if (Constants.isSwaggerEnabled) {
    // Swagger configuration
    const options = new DocumentBuilder()
      .setTitle('S3PWeb / API to convert html5 to image or pdf')
      .setVersion('v2')
      .addServer('http://localhost:3080/v1', 'Development server')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('explorer', app, document);
  }

  await app.listen(3080);
}

bootstrap();
