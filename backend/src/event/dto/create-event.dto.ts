import { Type } from 'class-transformer';
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
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsEmail()
  contact: string;

  @IsString()
  @IsNotEmpty()
  imageUrl?: string;

  @IsNumber()
  totalTickets: number;

  @IsNumber()
  priceCents: number;

  @ValidateNested()
  @Type(() => CreateLocationDto)
  location: CreateLocationDto;
}
