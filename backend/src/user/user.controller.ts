import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
import { SessionGuard } from '../auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';

@ApiCookieAuth('connect.sid')
@ApiTags('User')
@UseGuards(SessionGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the profile of the logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'Returns user profile information',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        firstName: 'Max',
        lastName: 'Mustermann',
        isAdmin: false,
        tickets: [],
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User not logged in or not authorized',
    schema: {
      example: {
        statusCode: 403,
        message: 'User has to be logged in',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: User profile does not exist',
    schema: {
      example: {
        statusCode: 404,
        message: 'User profile not found',
        error: 'Not Found',
      },
    },
  })
  async getProfile(@CurrentUser() user: { userId: number }) {
    return this.userService.getUserById(user.userId);
  }
}
