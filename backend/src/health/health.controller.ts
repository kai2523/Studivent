import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient } from 'redis';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check for the service, database, and Redis',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the status of the service, Redis, and the database',
    schema: {
      example: {
        status: 'ok',
        redis: 'ok',
        db: 'ok',
        uptime: 123.456,
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable if Redis or DB are down',
    schema: {
      example: {
        status: 'fail',
        redis: 'fail',
        db: 'ok',
        uptime: 456.789,
      },
    },
  })
  async getHealth() {
    const redis = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });

    let redisOk = false;
    let dbOk = false;

    try {
      await redis.connect();
      const pong = await redis.ping();
      redisOk = pong === 'PONG';
    } catch {
      redisOk = false;
    } finally {
      if (redis.isOpen) await redis.quit();
    }

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }

    return {
      status: redisOk && dbOk ? 'ok' : 'fail',
      redis: redisOk ? 'ok' : 'fail',
      db: dbOk ? 'ok' : 'fail',
      uptime: process.uptime(),
    };
  }
}
