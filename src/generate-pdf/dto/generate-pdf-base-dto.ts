import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GeneratePdfBaseDto {
  @ApiProperty({
    description: 'The format of the document to generate',
    example: 'pdf',
    enum: ['image', 'IMAGE', 'pdf', 'PDF'],
  })
  @IsNotEmpty({ message: 'Format must not be empty' })
  @IsString({ message: 'Format must be a string' })
  @IsIn(['image', 'IMAGE', 'pdf', 'PDF'], { message: 'Format must be either image or pdf' })
  format: string;

  @ApiPropertyOptional({
    description: 'Optional CSS selector to wait for before capturing the page',
    example: '#content',
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
