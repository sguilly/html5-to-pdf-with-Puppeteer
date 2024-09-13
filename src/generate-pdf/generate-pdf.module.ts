import { Module } from '@nestjs/common';
import { GeneratePdfController } from './generate-pdf.controller';
import { GeneratePdfService } from './generate-pdf.service';
import { ConvertTools } from './tools/convert-tool';

@Module({
  controllers: [GeneratePdfController],
  providers: [GeneratePdfService, ConvertTools],
})
export class GeneratePdfModule {}
