import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GeneratePdfFromUrlDto {
  @ApiProperty({
    description: 'The URL of the page to generate the document from',
    example: 'https://example.com',
  })
  @IsNotEmpty({ message: 'URL must not be empty' })
  @IsString({ message: 'URL must be a string' })
  url: string;

  @ApiProperty({
    description: 'The format of the generated document',
    enum: ['image', 'pdf'],
    example: 'pdf',
  })
  @IsNotEmpty({ message: 'Format must not be empty' })
  @IsString({ message: 'Format must be a string' })
  @IsIn(['image', 'pdf'], { message: 'Format must be either image or pdf' })
  format: string;

  @ApiProperty({
    description: 'Optional CSS selector to wait for before capturing the page',
    example: '#content',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'WaitFor must be a string if provided' })
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
