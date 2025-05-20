import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIntentDto {
  @IsInt()
  @Type(() => Number)
  eventId!: number;            

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number = 1;
}
