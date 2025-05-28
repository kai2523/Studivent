import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver'; // You need to install this separately

@Injectable({
  providedIn: 'root', // Important: makes it available app-wide without AppModule
})
export class PdfDownloadService {

  constructor(private http: HttpClient) {}

  downloadPdf(pdfUrl: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'x-api-key': 'miwses-fIxnaf-5jinfy'
    });

    return this.http.get(pdfUrl, {
      headers,
      responseType: 'blob'
    });
  }

  savePdf(blob: Blob, filename: string) {
    saveAs(blob, filename);
  }
}
