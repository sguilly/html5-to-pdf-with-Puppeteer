import { Module } from '@nestjs/common';
import { ConvertTools } from '../utils/tools/convert-tool';
import { GeneratePdfController } from './generate-pdf.controller';
import { GeneratePdfService } from './generate-pdf.service';

@Module({
  controllers: [GeneratePdfController],
  providers: [GeneratePdfService, ConvertTools],
})
export class GeneratePdfModule {}
