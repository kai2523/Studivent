import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
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
    title: string;
    @IsString()
    description: string;
  
    @IsDate()
    @Type(() => Date)
    date: Date;
  
    @IsEmail()
    contact: string;
  
    @IsString()
    imageUrl?: string;
  
    @IsNumber()
    totalTickets: number;
  
    @ValidateNested()
    @Type(() => CreateLocationDto)
    location: CreateLocationDto;
  }
  