import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx
    .switchToHttp()
    .getRequest<Request & { session?: { user?: { userId: number; email: string } } }>();
  return request.session?.user;
});
