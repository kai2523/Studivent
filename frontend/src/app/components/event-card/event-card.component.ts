// event-card.component.ts
import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfDownloadService } from '../../services/pdf-download.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { PDFDocument, PDFPage } from 'pdf-lib';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent implements OnDestroy {
  @Input() event!: any;

  isDetailMode = false;
  bookingMode = false;
  ticketCount = 1;

  @ViewChild('cardInfo') cardInfo!: ElementRef<HTMLDivElement>;

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private card: StripeCardElement | null = null;
  clientSecret: string | null = null;

  paymentMode = false;
  paymentError: string | null = null;
  paymentSuccess = false;

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
    this.card?.unmount();
  }

  get maxTickets(): number {
    return this.event?.totalTickets ?? 10;
  }

  get formattedPrice(): string {
    const euros = (this.event?.priceCents ?? 0) / 100;
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(euros) + '€';
  }

  get formattedTotal(): string {
    const total = ((this.event?.priceCents ?? 0) * this.ticketCount) / 100;
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(total) + '€';
  }

  toggleDetailMode(): void {
    this.isDetailMode = !this.isDetailMode;
    if (!this.isDetailMode) {
      this.bookingMode = false;
      this.resetPaymentState();
    }
  }

  toggleBooking(): void {
    this.bookingMode = !this.bookingMode;
    if (!this.bookingMode) {
      this.resetPaymentState();
    }
  }

  increment(): void {
    if (this.ticketCount < this.maxTickets) {
      this.ticketCount++;
    }
  }

  decrement(): void {
    if (this.ticketCount > 1) {
      this.ticketCount--;
    }
  }

async onDownloadPdf(): Promise<void> {
  const tickets = this.event?.tickets ?? [];
  if (tickets.length === 0) {
    return;
  }

  // Single ticket: just download & save
  if (tickets.length === 1) {
    const ticket = tickets[0];
    const url = `https://studivent-dhbw.de/api/tickets/${ticket.id}/pdf`;
    const blob = await firstValueFrom(this.pdfService.downloadPdf(url));
    this.pdfService.savePdf(blob, `${this.event.title}-ticket-1.pdf`);
    return;
  }

  // Multiple tickets: merge into one PDF
  const mergedPdf: PDFDocument = await PDFDocument.create();

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const url = `https://studivent-dhbw.de/api/tickets/${ticket.id}/pdf`;

    // download each ticket PDF
    const blob = await firstValueFrom(this.pdfService.downloadPdf(url));
    const arrayBuffer = await blob.arrayBuffer();
    const donorPdf: PDFDocument = await PDFDocument.load(arrayBuffer);

    // copy all pages from the donor into the merged
    const pages: PDFPage[] = await mergedPdf.copyPages(
      donorPdf,
      donorPdf.getPageIndices()
    );

    // now page is correctly typed as PDFPage
    pages.forEach((page: PDFPage) => {
      mergedPdf.addPage(page);
    });
  }

  // finalize and save
  const mergedBytes = await mergedPdf.save();
  const mergedBlob = new Blob([mergedBytes], { type: 'application/pdf' });
  this.pdfService.savePdf(
    mergedBlob,
    `${this.event.title}-tickets.pdf`
  );
}


  initPayment(): void {
    this.http
      .post<{ clientSecret: string }>('/api/payment/create-intent', {
        eventId: this.event.id,
        quantity: this.ticketCount
      })
      .subscribe(({ clientSecret }) => {
        this.clientSecret = clientSecret;
        this.paymentMode = true;
        this.paymentError = null;
        this.paymentSuccess = false;

        this.cd.detectChanges();

        const style = {
          base: {
            fontSize: '1rem',
            color: '#212529',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            '::placeholder': { color: '#6c757d' }
          },
          invalid: { color: '#dc3545' }
        };

        this.elements = this.stripe!.elements({ clientSecret });
        this.card = this.elements.create('card', { style });
        this.card.mount(this.cardInfo.nativeElement);
      }, err => {
        this.paymentError = 'Fehler beim Erstellen der Zahlung.';
      });
  }

  async confirmPayment(): Promise<void> {
    if (!this.stripe || !this.card || !this.clientSecret) return;

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(
      this.clientSecret,
      { payment_method: { card: this.card } }
    );

    if (error) {
      this.paymentError = error.message ?? 'Zahlung fehlgeschlagen';
    } else if (paymentIntent?.status === 'succeeded') {
      this.paymentSuccess = true;
    }
  }

  private resetPaymentState(): void {
    this.paymentMode = false;
    this.paymentError = null;
    this.paymentSuccess = false;
    this.card?.unmount();
  }
}