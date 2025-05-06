import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver'; // You need to install this separately

@Injectable({
  providedIn: 'root', // Important: makes it available app-wide without AppModule
})
export class PdfDownloadService {

  constructor(private http: HttpClient) {}

  downloadPdf(): Observable<Blob> {
    const pdfUrl = 'https://www.etas.com/ww/media/a_ordering_information/etas-es921-ordering-information.pdf'; // Dummy PDF URL
    return this.http.get(pdfUrl, { responseType: 'blob' });
  }

  savePdf(blob: Blob, filename: string) {
    saveAs(blob, filename);
  }
}
