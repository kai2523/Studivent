import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ShibData } from './shib-data.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @ApiOperation({ summary: 'Initiate login flow (SSO)' })
  @ApiResponse({
    status: 302,
    description: 'Redirects user to login flow (no response body)',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Unexpected error occurred',
        error: 'Internal Server Error',
      },
    },
  })
  async login(@Req() req: Request & { shib: ShibData }, @Res() res: Response) {
    return this.authService.handleLogin(req, res);
  }

  @Get('logout')
  @ApiOperation({ summary: 'Logout and clear session' })
  @ApiResponse({
    status: 200,
    description: 'Redirects to the homepage after logout (no response body)',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Unexpected error occurred',
        error: 'Internal Server Error',
      },
    },
  })
  logout(@Req() req: Request, @Res() res: Response) {
    return this.authService.handleLogout(req, res);
  }
}
