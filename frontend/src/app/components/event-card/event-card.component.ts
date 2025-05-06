import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfDownloadService } from '../../services/pdf-download.service';

@Component({
  selector: 'app-event-card',
  imports: [CommonModule],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.scss'
})
export class EventCardComponent {

  constructor(private pdfService: PdfDownloadService) {}

  @Input() event: any;

  isDetailMode = false;

  toggleDetailMode() {
    this.isDetailMode = !this.isDetailMode;
  }

  onDownloadPdf() {
    this.pdfService.downloadPdf().subscribe((pdfBlob) => {
      this.pdfService.savePdf(pdfBlob, 'sample-download.pdf');
    });
  }
}
