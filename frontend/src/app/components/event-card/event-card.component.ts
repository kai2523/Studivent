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
import { ChangeDetectorRef } from '@angular/core';
import { PDFDocument } from 'pdf-lib';
import { firstValueFrom } from 'rxjs';

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
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {
    loadStripe('pk_test_51RQpJWGHYQwFXMHiHQsZVHgUNuZ8q3cn94XR3s4iaGm3MSex7nBRPB1mZFQNW9J1YRUpEaQWNlsM3j5FDDSuB92M00VgBuQuJl')
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

  async onDownloadPdf(): Promise<void> {
  const tickets = this.event?.tickets ?? [];
  if (tickets.length === 0) {
    return;
  }

  // Single ticket: just download it
  if (tickets.length === 1) {
    const ticket = tickets[0];
    const url = `https://studivent-dhbw.de/api/tickets/${ticket.id}/pdf`;
    const blob = await firstValueFrom(this.pdfService.downloadPdf(url));
    this.pdfService.savePdf(blob, `${this.event.title}-ticket-1.pdf`);
    return;
  }

  // Multiple tickets: merge into one PDF
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const url = `https://studivent-dhbw.de/api/tickets/${ticket.id}/pdf`;
    const blob = await firstValueFrom(this.pdfService.downloadPdf(url));
    const arrayBuffer = await blob.arrayBuffer();

    const donorPdf = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  const mergedBlob = new Blob([mergedBytes], { type: 'application/pdf' });
  this.pdfService.savePdf(mergedBlob, `${this.event.title}-tickets.pdf`);
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
        if (!this.stripe) {
          console.error('Stripe not initialized');
          return;
        }

        // 1) Enable the paymentMode panel so <div #cardInfo> exists
        this.paymentMode = true;

        // 2) Let Angular render it & update the ViewChild
        this.cd.detectChanges();

        // 3) Now we can safely create and mount Stripe Elements
        this.elements = this.stripe.elements({ clientSecret });
        this.card = this.elements.create('card');
        this.card.mount(this.cardInfo.nativeElement);
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
