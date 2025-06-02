import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIntentDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the event for which payment is being created',
  })
  @IsInt()
  @Type(() => Number)
  eventId!: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Number of tickets to purchase (default is 1)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number = 1;
}
