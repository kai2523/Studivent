import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
import { SessionGuard } from '../auth/auth.guard';

@UseGuards(SessionGuard)
@Controller('user')
export class UserController {
   constructor(private readonly userService: UserService) {}

   @Get('me')
   async getProfile(@CurrentUser() user: { userId: number }) {
    return this.userService.getUserById(user.userId);
   }
}
