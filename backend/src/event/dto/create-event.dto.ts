import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'Mobilat', description: 'The name of the location' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Salzstraße 27',
    description: 'The address of the location',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: 'Heilbronn',
    description: 'The city of the location',
  })
  @IsString()
  city: string;

  @ApiProperty({
    example: 'Germany',
    description: 'The country of the location',
  })
  @IsString()
  country: string;

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

export class CreateEventDto {
  @ApiProperty({
    example: 'Semester opening party',
    description: 'The title of the event',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Semester opening party.',
    description: 'The event description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: '2025-09-15T09:00:00.000Z',
    description: 'Date and time of the event',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    example: 'organizer@example.com',
    description: 'Contact email for the event',
  })
  @IsEmail()
  contact: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/events/banner.jpg',
    description: 'URL to the event banner image',
  })
  @IsString()
  @IsNotEmpty()
  imageUrl?: string;

  @ApiProperty({
    example: 150,
    description: 'Total number of tickets available',
  })
  @IsNumber()
  totalTickets: number;

  @ApiProperty({ example: 1000, description: 'Price of the event in cents' })
  @IsNumber()
  priceCents: number;

  @ApiProperty({
    description: 'Location details for the event',
    type: () => CreateLocationDto,
  })
  @ValidateNested()
  @Type(() => CreateLocationDto)
  location: CreateLocationDto;
}
