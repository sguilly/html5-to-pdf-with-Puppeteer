import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorrelationIdMiddleware, HttpExceptionsLoggerFilter, LoggingService } from '@s3pweb/nestjs-common';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Utils } from './utils/common.utils';
import { Constants } from './utils/constants.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use our logger for all Nest logs
  const logger = await app.resolve(LoggingService);
  app.useLogger(logger);
  // Add custom filter to log all http errors
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionsLoggerFilter(logger, httpAdapter));

  if (Constants.isCompressionEnabled) {
    app.use(compression());
  }

  // Tracking ID
  app.use(CorrelationIdMiddleware());

  // Without app.enableCors the custom headers (Authorization, token) will go into "Access-Control-Request-Headers"
  // It needs app.enableCors to be added to "Access-Control-Allow-Headers" to be readable
  app.enableCors({
    ...(!Utils.isDevMode()
      ? {
          origin: [/^https?:\/\/localhost:3333$/],
        }
      : {}),
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  });

  app.use(helmet());

  app.use(bodyParser.json({ limit: Constants.maxFileSizeInBytes }));
  app.use(
    bodyParser.urlencoded({
      limit: Constants.maxFileSizeInBytes,
      extended: true,
      parameterLimit: 1000000, // @see https://stackoverflow.com/a/44854199
    }),
  );

  if (Constants.isSwaggerEnabled) {
    // Swagger configuration
    const swaggerConfig = new DocumentBuilder()
      .setTitle('S3PWeb / API to convert html5 to image or pdf')
      .setVersion('v2')
      .addServer('http://localhost:3080/v2', 'Development server')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('explorer', app, document);
  }

  await app.listen(3080);
}

bootstrap();
