import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { GeneratePdfBaseDto } from './generate-pdf-base-dto';

export class GeneratePdfFromUrlDto extends GeneratePdfBaseDto {
  @ApiProperty({
    description: 'The URL of the page to generate the document from',
    example: 'https://example.com',
  })
  @IsNotEmpty({ message: 'URL must not be empty' })
  @IsString({ message: 'URL must be a string' })
  url: string;
}
