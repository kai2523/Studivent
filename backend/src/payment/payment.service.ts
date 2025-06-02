import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

  createPaymentIntent(amount: number, metadata: Record<string, string>) {
    return this.stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata,
    });
  }

  constructEvent(payload: Buffer, signature: string, secret: string) {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
