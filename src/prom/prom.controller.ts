import { Controller, Get, Header } from '@nestjs/common';
import * as promClient from 'prom-client';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Internal')
@Controller()
export class PromController {
  @Get('metrics')
  @Header('Content-Type', promClient.register.contentType)
  async getMetrics(): Promise<string> {
    return promClient.register.metrics();
  }
}
