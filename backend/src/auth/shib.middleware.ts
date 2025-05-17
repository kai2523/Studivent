import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

interface ShibSession {
  attributes: Record<string,string[]>;
}

@Injectable()
export class ShibMiddleware implements NestMiddleware {
  async use(req: Request & { shib?: any }, _res: Response, next: NextFunction) {
    if (req.path !== '/auth/login') {
      return next();
    }

    // 1) grab the browser's Shib cookies
    const cookieHeader = req.headers['cookie'];
    if (!cookieHeader) {
      throw new UnauthorizedException('No Shibboleth cookies');
    }

    // 2) call the SP Session handler for JSON
    let session: ShibSession;
    try {
      const resp = await axios.get<ShibSession>(
        'https://sp.studivent-dhbw.de/Shibboleth.sso/Session',
        {
          headers: {
            Cookie: cookieHeader,
            Accept: 'application/json',
          },
          // if your SP is HTTPS with a self-signed cert, you may need:
          // httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        }
      );
      session = resp.data;
    } catch (err) {
      console.error('Failed to fetch Shib session:', err);
      throw new UnauthorizedException('Unable to retrieve Shibboleth session');
    }

    // 3) pluck the first value of each attribute array
    const attrs = session.attributes || {};
    const email     = Array.isArray(attrs.mail)      ? attrs.mail[0]      : undefined;
    const givenName = Array.isArray(attrs.givenName) ? attrs.givenName[0] : undefined;
    const sn        = Array.isArray(attrs.sn)        ? attrs.sn[0]        : undefined;

    // 4) defend against missing values
    if (!email || !givenName || !sn) {
      console.error('Missing Shibboleth attrs', attrs);
      throw new UnauthorizedException('Shibboleth attributes not found');
    }

    // 5) attach to req.shib for your controller to use
    req.shib = { email, givenName, sn };
    next();
  }
}
