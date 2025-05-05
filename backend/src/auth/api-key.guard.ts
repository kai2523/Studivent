import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (req.method === 'OPTIONS') {
      return true;
    }
    const expected = this.config.get<string>('API_KEY');

    const key =
      req.headers['x-api-key'] ||
      req.headers['authorization']?.toString().replace('Api-Key ', '');

    return key === expected;
  }
}

