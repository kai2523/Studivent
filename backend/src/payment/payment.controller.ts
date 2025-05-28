import { Body, Controller, Post, Req, Res, UseGuards, Headers } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { TicketService } from '../ticket/ticket.service';
import { UserService } from '../user/user.service';
import { EventService } from '../event/event.service';
import { SessionGuard } from '../auth/auth.guard';
import { CreateIntentDto } from './dto/create-intent.dto';
import Stripe from 'stripe';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiHeader,
  ApiCookieAuth,
} from '@nestjs/swagger';

type RawBodyRequest = Request & { rawBody: Buffer };

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly ticketService: TicketService,
    private readonly userService: UserService,
    private readonly eventService: EventService,
  ) {}

  @UseGuards(SessionGuard)
  @Post('create-intent')
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: 'Create a Stripe PaymentIntent for an event' })
  @ApiBody({ type: CreateIntentDto })
  @ApiResponse({
    status: 201,
    description: 'Returns the Stripe PaymentIntent client secret and ID',
    schema: {
      example: {
        id: 'pi_3RQuZ6GHYQwFXMHi06fAoiqj',
        clientSecret: 'some_client_secret',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid input data (e.g., quantity must be >= 1)',
    schema: {
      example: {
        statusCode: 400,
        message: ['quantity must be a positive number'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User has to be logged in',
    schema: {
      example: {
        statusCode: 403,
        message: 'User has to be logged in',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: Event does not exist',
    schema: {
      example: {
        statusCode: 404,
        message: 'Event #1 not found',
        error: 'Not Found',
      },
    },
  })
  async createIntent(@Body() dto: CreateIntentDto, @Req() req: Request) {
    const userId = req.session?.user?.userId as number;
    const user = await this.userService.getUserById(userId);

    const event = await this.eventService.findOne(dto.eventId);
    if (!event) throw new Error('Event not found');

    const amount = event.priceCents * dto.quantity;

    const intent = await this.paymentService.createPaymentIntent(amount, {
      userId: String(userId),
      eventId: String(event.id),
      ownerEmail: user.email,
      quantity: String(dto.quantity),
    });

    return {
      id: intent.id,
      clientSecret: intent.client_secret,
    };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe signature for verifying webhook requests',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Acknowledges successful processing of the webhook',
    schema: {
      example: {
        received: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'If the Stripe signature verification fails',
    schema: {
      example: {
        error: 'Webhook error: Invalid signature',
      },
    },
  })
  async handleWebhook(
    @Req() req: RawBodyRequest,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    try {
      event = this.paymentService.constructEvent(req.body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook error:', (err as Error).message);
      return res.status(400).send(`Webhook error: ${(err as Error).message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;

      const userId = parseInt(intent.metadata.userId);
      const eventId = parseInt(intent.metadata.eventId);
      const email = intent.metadata.ownerEmail;
      const qty = Number(intent.metadata.quantity ?? '1');

      const existing = await this.ticketService.findTicketsByPaymentIntent(intent.id);
      if (existing.length === 0) {
        await this.ticketService.createFromStripe({
          userId,
          eventId,
          ownerEmail: email,
          paymentIntentId: intent.id,
          quantity: qty,
        });
      }
    }

    res.json({ received: true });
  }
}
