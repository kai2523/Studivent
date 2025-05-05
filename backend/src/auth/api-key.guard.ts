import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly expectedKey = process.env.API_KEY;

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (req.method === 'OPTIONS') {
      return true;
    }

    const key =
      req.headers['x-api-key'] ||
      req.headers['authorization']?.toString().replace('Api-Key ', '');

    return key === this.expectedKey;
  }
}

