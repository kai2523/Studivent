import { IsUUID } from 'class-validator';

export class ValidateTicketDto {
  @IsUUID()
  code: string;
}
