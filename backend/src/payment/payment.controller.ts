import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { TicketService } from '../ticket/ticket.service';
import { UserService } from '../user/user.service';
import { EventService } from '../event/event.service';
import { SessionGuard } from '../auth/auth.guard';
import { CreateIntentDto } from './dto/create-intent.dto';
import Stripe from 'stripe';

type RawBodyRequest = Request & { rawBody: Buffer };

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
  async createIntent(
    @Body() dto: CreateIntentDto,
    @Req() req: Request,
  ) {
    const userId = req.session?.user?.userId as number;
    const user = await this.userService.getUserById(userId);

    const event  = await this.eventService.findOne(dto.eventId);
    if (!event)  throw new Error('Event not found');

    const amount  = event.priceCents * (dto.quantity);

    const intent  = await this.paymentService.createPaymentIntent(amount, {
        userId:   String(userId),
        eventId:  String(event.id),
        ownerEmail: user.email,
        quantity: String(dto.quantity),
        });

    return {
      id:           intent.id,         
      clientSecret: intent.client_secret,
    };
  }

  @Post('webhook')
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
      const intent = event.data.object as Stripe.PaymentIntent;

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
