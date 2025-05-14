import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ShibMiddleware implements NestMiddleware {
  use(req: Request & { shib?: any }, _res: Response, next: NextFunction) {

    if (req.path !== '/auth/login') return next();

    req.shib = {
      email: req.headers['x-shib-mail'] as string,
      givenName: req.headers['x-givenname'] as string,
      sn:    req.headers['x-surname'] as string,
    };

    next();
  }
}
