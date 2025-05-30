import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response } from 'express';
import { ShibData } from './shib-data.interface';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async handleLogin(req: Request & { shib: ShibData }, res: Response): Promise<void> {
    const { email, givenName, surname, persistentId } = req.shib;

    let user = await this.prisma.user.findUnique({
      where: { persistentId },
    });

    if (user) {
      user = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        firstName: givenName,
        lastName: surname,
      },
    });
    } else {
      user = await this.prisma.user.create({
        data: {
          persistentId,
          email,
          firstName: givenName,
          lastName: surname,
        },
      });
    }

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
