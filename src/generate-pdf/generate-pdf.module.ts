import { Module } from '@nestjs/common';
import { GeneratePdfController } from './generate-pdf.controller';
import { GeneratePdfService } from './generate-pdf.service';

@Module({
  controllers: [GeneratePdfController],
  providers: [GeneratePdfService],
})
export class GeneratePdfModule {}
