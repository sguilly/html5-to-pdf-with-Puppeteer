import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GenerateDocumentDto {
  @ApiProperty({
    description: 'Format du document à générer',
    example: 'image',
    enum: ['image', 'pdf'],
  })
  @IsString()
  format: string;

  @ApiProperty({
    description: 'Code HTML à convertir en document',
    example: '<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>',
  })
  @IsString()
  html: string;

  @ApiPropertyOptional({
    description: 'ID CSS d’un élément à attendre avant la génération du document',
    example: 'myHeader',
  })
  @IsOptional()
  @IsString()
  waitFor?: string;
}
