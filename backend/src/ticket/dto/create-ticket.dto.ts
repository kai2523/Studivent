import { IsEmail, IsInt, Min } from "class-validator";

export class CreateTicketDto {

    @IsEmail()
    ownerEmail: string;

    @IsInt()
    eventId: number;

    @IsInt()
    @Min(1)
    quantity = 1;

  }
  