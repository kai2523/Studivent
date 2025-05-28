import { Component, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfDownloadService } from '../../services/pdf-download.service';
import { Router } from '@angular/router';
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardElement
} from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent implements OnDestroy {
  @Input() event: any;

  isDetailMode = false;
  bookingMode = false;
  ticketCount = 1;
  maxTickets = 10;

  @ViewChild('cardInfo') cardInfo!: ElementRef<HTMLDivElement>;

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private card: StripeCardElement | null = null;
  clientSecret: string | null = null;
  paymentMode = false;
  paymentError: string | null = null;

  constructor(
    private pdfService: PdfDownloadService,
    private router: Router,
    private http: HttpClient
  ) {
    loadStripe('pk_test_YOUR_PUBLISHABLE_KEY')
      .then(s => (this.stripe = s))
      .catch(err => console.error('Stripe load error', err));
  }

  ngOnDestroy() {
    // unmount card element if needed
    this.card?.unmount();
  }

  toggleDetailMode(): void {
    this.isDetailMode = !this.isDetailMode;
    if (!this.isDetailMode) {
      this.bookingMode = false;
    }
  }

  toggleBooking(): void {
    this.bookingMode = !this.bookingMode;
  }

  increment(): void {
    if (this.event && this.ticketCount < this.event.totalTickets) {
      this.ticketCount++;
    }
  }

  decrement(): void {
    if (this.ticketCount > 1) {
      this.ticketCount--;
    }
  }

  proceedToStripe(): void {
    this.router.navigate(['/checkout'], {
      queryParams: {
        eventId: this.event.id,
        tickets: this.ticketCount
      }
    });
  }

  downloadAllTickets(): void {

  }

  onDownloadPdf(): void {
  if (!this.event?.tickets?.length) {
    return;
  }

  this.event.tickets.forEach((ticket: any, index: any) => {
    const url = `https://studivent-dhbw.de/api/tickets/${ticket.id}/pdf`;
    console.log(url)
    this.pdfService.downloadPdf(url).subscribe(blob => {
      // Name the file using the event title and ticket index (or ticket.id if you have one)
      const filename = `${this.event.title}-ticket-${index + 1}.pdf`;
      this.pdfService.savePdf(blob, filename);
    }, err => {
      console.error(`Error downloading ticket #${index + 1}`, err);
    });
  });
}


  /**
   * Format priceCents to German currency style, e.g. 1.234,00€
   */
  get formattedPrice(): string {
    const euros = (this.event?.priceCents ?? 0) / 100;
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(euros) + '€';
  }

  /**
   * Calculate total and format, based on ticketCount
   */
  get formattedTotal(): string {
    const euros = ((this.event?.priceCents ?? 0) * this.ticketCount) / 100;
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(euros) + '€';
  }

  initPayment() {
    this.http
      .post<{ clientSecret: string }>('/api/payment/create-intent', {
        eventId: this.event.id,
        quantity: this.ticketCount
      })
      .subscribe(async ({ clientSecret }) => {
        this.clientSecret = clientSecret;
        if (!this.stripe) return console.error('Stripe not initialized');
        // set up Elements
        this.elements = this.stripe.elements({ clientSecret });
        this.card = this.elements.create('card');
        this.card.mount(this.cardInfo.nativeElement);
        this.paymentMode = true;
      });
  }

  /** Confirm the card payment */
  async confirmPayment() {
    if (!this.stripe || !this.card || !this.clientSecret) return;
    const { error, paymentIntent } = await this.stripe.confirmCardPayment(
      this.clientSecret,
      { payment_method: { card: this.card } }
    );

    if (error) {
      this.paymentError = error.message ?? 'Zahlung fehlgeschlagen';
    } else if (paymentIntent?.status === 'succeeded') {
      alert('Zahlung erfolgreich! 🎉');
      this.toggleDetailMode();
      // optionally navigate or refresh ticket status
    }
  }
}
