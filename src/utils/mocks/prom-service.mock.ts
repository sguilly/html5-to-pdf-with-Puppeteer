import { MetricsInterface } from '@s3pweb/nestjs-common';

export class PromServiceMock implements MetricsInterface {
  getPrometheusClient = jest.fn();

  incErrorsCounter = jest.fn();

  incWarnsCounter = jest.fn();

  incCronCounter = jest.fn();

  failedRequests = jest.fn();

  incFailedRequestsCounter = jest.fn();

  incRequestsCounter = jest.fn();

  observeRequestDuration = jest.fn();
}
