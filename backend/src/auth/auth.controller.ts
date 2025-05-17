import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('login')
  async login(@Req() req: Request, @Res() res: Response) {

    const email = req.headers['x-shib-mail'] as string;
    const givenName = req.headers['x-givenname'] as string;
    const sn = req.headers['x-surname'] as string;
    
    const user = await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        firstName: givenName,
        lastName: sn,
      },
    });

    req.session.user = {
      userId: user.id,
      email: user.email,
    };
    
    return res.redirect('https://studivent-dhbw.de/event')
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Fehler beim Logout:', err);
        return res.status(500).send('Logout fehlgeschlagen');
      }

      res.clearCookie('connect.sid'); 
      return res.redirect('/');
    });
  }

}
