import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { GeneratePdfBaseDto } from './generate-pdf-base-dto';

export class GeneratePdfFromHtmlDto extends GeneratePdfBaseDto {
  @ApiProperty({
    description: 'HTML content to convert into a document',
    example: '<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>',
  })
  @IsNotEmpty({ message: 'HTML must not be empty' })
  @IsString({ message: 'HTML must be a string' })
  html: string;
}
