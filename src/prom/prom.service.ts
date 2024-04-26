import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';
import { MetricsInterface } from '@s3pweb/nestjs-common';

@Injectable()
export class PromService implements MetricsInterface {
  public requestDurationMs: promClient.Histogram;
  public request: promClient.Counter;
  public failedRequests: promClient.Counter;
  private errors: promClient.Counter;
  private warnings: promClient.Counter;

  constructor() {
    promClient.collectDefaultMetrics();

    this.requestDurationMs = new promClient.Histogram({
      name: 'base_api_request_duration_ms',
      help: 'Processing duration in ms',
      labelNames: ['method', 'route', 'code'],
      buckets: [250, 500, 1000, 2000, 5000, 10000, 30000, 60000],
    });

    this.request = new promClient.Counter({
      name: 'base_api_request_count',
      help: 'Number of requests',
      labelNames: ['method', 'route', 'user', 'ip'],
    });

    this.failedRequests = new promClient.Counter({
      name: 'base_api_failed_requests_count',
      help: 'Number of failed requests',
      labelNames: ['method', 'route', 'code', 'user'],
    });

    this.errors = new promClient.Counter({
      name: 'base_api_errors_counter',
      help: 'Errors counter by services and methods',
      labelNames: ['type', 'function'],
    });

    this.warnings = new promClient.Counter({
      name: 'base_api_warnings_count',
      help: 'Warnings counter by services and methods',
      labelNames: ['type', 'function'],
    });
  }

  getPrometheusClient() {
    return promClient;
  }

  incErrorsCounter(type: string, func: string) {
    this.errors.inc({ type: type, function: func });
  }

  incWarnsCounter(type: string, func: string) {
    this.warnings.inc({ type: type, function: func });
  }
}
