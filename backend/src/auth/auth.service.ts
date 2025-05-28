import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response } from 'express';
import { ShibData } from './shib-data.interface';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async handleLogin(req: Request & { shib: ShibData }, res: Response): Promise<void> {
    const { email, givenName, surname, persistentId } = req.shib;

    const user = await this.prisma.user.upsert({
      where: { persistentId },
      update: {
        email,
        firstName: givenName,
        lastName: surname,
      },
      create: {
        persistentId,
        email,
        firstName: givenName,
        lastName: surname,
      },
    });

    req.session.user = {
      userId: user.id,
      email: user.email,
    };

    res.redirect('/event');
  }

  handleLogout(req: Request, res: Response): void {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        res.status(500).send('Logout failed');
      } else {
        res.clearCookie('connect.sid');
        res.redirect('/');
      }
    });
  }
}
