import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GeneratePdfFromHtmlDto {
  @ApiProperty({
    description: 'The format of the page to generate',
    example: 'image',
    enum: ['image', 'pdf'],
  })
  @IsString()
  format: string;

  @ApiProperty({
    description: 'Code HTML to convert in to document',
    example: '<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>',
  })
  @IsString()
  html: string;

  @ApiPropertyOptional({
    description: 'ID CSS Optional CSS selector to wait for before capturing the page ',
    example: 'myHeader',
  })
  @IsOptional()
  @IsString()
  waitFor?: string;

  @ApiProperty({
    description: 'Whether to print the background in the PDF',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  printBackground?: boolean;

  @ApiProperty({
    description: 'Whether to display page numbers in the PDF',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  pageNumber?: boolean;
}
