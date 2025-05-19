import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TextDecoder } from 'util';

function decodeLatin1ToUtf8(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return new TextDecoder('utf-8').decode(Buffer.from(value, 'latin1'));
}

@Injectable()
export class ShibMiddleware implements NestMiddleware {
  use(req: Request & { shib?: any }, _res: Response, next: NextFunction) {
    if (req.path !== '/auth/login') {
      return next();
    }

    const emailRaw     = req.headers['x-mail'] as string | undefined;
    const displayNameRaw = req.headers['x-displayname'] as string | undefined;
    const persistentIdRaw = req.headers['x-persistent-id'] as string | undefined;

    const email     = decodeLatin1ToUtf8(emailRaw);
    const displayName = decodeLatin1ToUtf8(displayNameRaw);
    const persistentId = decodeLatin1ToUtf8(persistentIdRaw);

    if (!email || !displayName || !persistentId) {
      console.error('Missing or invalid Shibboleth headers:', {
        'x-mail': emailRaw,
        'x-displayName': displayName,
        'x-persistent-id': persistentIdRaw,
      });
      throw new UnauthorizedException('Shibboleth headers missing');
    }

    req.shib = { email, displayName, persistentId };
    next();
  }
}
