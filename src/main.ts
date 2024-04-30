import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorrelationIdMiddleware, HttpExceptionsLoggerFilter, LoggingService } from '@s3pweb/nestjs-common';
import helmet from 'helmet';

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

  await app.listen(3000);
}

bootstrap();
