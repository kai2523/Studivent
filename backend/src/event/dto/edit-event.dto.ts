import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class EditLocationDto {
  @ApiPropertyOptional({
    example: 'Mobilat',
    description: 'The name of the location',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Salzstraße 27',
    description: 'The address of the location',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: 'Heilbronn',
    description: 'The city of the location',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    example: 'Germany',
    description: 'The country of the location',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    example: 49.153017,
    description: 'Latitude of the location',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    example: 9.218763,
    description: 'Longitude of the location',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;
}

export class EditEventDto {
  @ApiPropertyOptional({
    example: 'Semester opening party',
    description: 'The title of the event',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Semester opening party.',
    description: 'The event description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '2025-09-15T09:00:00.000Z',
    description: 'Date and time of the event',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({
    example: 'organizer@example.com',
    description: 'Contact email for the event',
  })
  @IsEmail()
  @IsOptional()
  contact?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/events/banner.jpg',
    description: 'URL to the event banner image',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 150,
    description: 'Total number of tickets available',
  })
  @IsNumber()
  @IsOptional()
  totalTickets?: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Price of the event in cents',
  })
  @IsNumber()
  @IsOptional()
  priceCents?: number;

  @ApiPropertyOptional({
    description: 'Location details for the event',
    type: () => EditLocationDto,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => EditLocationDto)
  location?: EditLocationDto;
}
