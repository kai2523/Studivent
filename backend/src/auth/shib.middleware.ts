import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ShibMiddleware implements NestMiddleware {
  use(req: Request & { shib?: any }, _res: Response, next: NextFunction) {
    if (req.path !== '/auth/login') {
      return next();
    }

    const email     = req.headers['x-mail'] as string | undefined;
    const givenName = req.headers['x-givenname'] as string | undefined;
    const sn        = req.headers['x-sn'] as string | undefined;

    if (!email || !givenName || !sn) {
      console.error('Missing Shibboleth headers:', {
        'x-mail': email,
        'x-givenname': givenName,
        'x-sn': sn,
      });
      throw new UnauthorizedException('Shibboleth headers missing');
    }

    req.shib = { email, givenName, sn };
    next();
  }
}
