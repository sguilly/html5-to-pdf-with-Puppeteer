import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import {
  LoggingService,
  METRICS_SERVICE,
  correlationId,
} from '@s3pweb/nestjs-common';
import { Request, Response } from 'express';
import { getClientIp } from 'request-ip';
import { PromService } from '../../prom/prom.service';

@Injectable()
export class RequestTrackerMiddleware implements NestMiddleware {
  private readonly log;
  private readonly excludedRoutes: Record<string, boolean>;

  constructor(
    logger: LoggingService,
    @Inject(METRICS_SERVICE) private readonly metricsService: PromService,
  ) {
    this.log = logger.getLogger(RequestTrackerMiddleware.name);
    this.excludedRoutes = {
      '/metrics': true,
      '/health': true,
    };
  }

  use(req: Request, res: Response, next: () => void): void {
    const start = process.hrtime();
    const uuid: string = req.headers[`${correlationId}`]?.toString();
    const clientIp = getClientIp(req);

    res.once('close', () => {
      const diff = process.hrtime(start);
      const responseTimeInMs = diff[0] * 1e3 + diff[1] * 1e-6;

      let url = req.baseUrl.split('?')[0];

      if (req.route?.path) {
        url = url + req.route.path.toString();
      }

      // We need to cast req to any because user object is not in type
      const anyReq: any = req;
      const outputId = anyReq.user?._id?.toString();
      const statusCode: string = res.writableEnded
        ? res.statusCode.toString()
        : '408';

      // metrics route is excluded to reduce log and prometheus spam
      if (!this.excludedRoutes[req.originalUrl]) {
        const message = `${req.method} ${
          req.originalUrl
        } (${outputId} from ${clientIp}), HTTP ${statusCode}, Request total time ${responseTimeInMs.toFixed(
          2,
        )} ms.`;

        // Log more data if we send back an error
        if (res.statusCode >= 400 || !res.writableEnded) {
          const failedRequest = {
            query: req.query,
            params: req.params,
            body: req.body,
          };
          this.log.warn(
            { uuid },
            `${message}\nFailed request: ${JSON.stringify(
              failedRequest,
              null,
              2,
            )}`,
          );
          // Track failed request
          this.metricsService.failedRequests.inc({
            method: req.method,
            route: url,
            code: statusCode,
            user: outputId,
          });
        } else {
          this.log.info({ uuid }, message);
        }
        // Track request
        this.metricsService.request.inc({
          method: req.method,
          route: url,
          user: outputId,
          ip: clientIp?.toString(),
        });
      }
      // Track response time
      this.metricsService.requestDurationMs
        .labels(req.method, url, statusCode)
        .observe(responseTimeInMs);
    });

    next();
  }
}
