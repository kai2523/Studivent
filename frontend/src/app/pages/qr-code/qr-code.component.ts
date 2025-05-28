import { Component, ViewChild, AfterViewInit } from '@angular/core';
import {
  NgxScannerQrcodeComponent,
  ScannerQRCodeResult,
  LOAD_WASM
} from 'ngx-scanner-qrcode';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { filter, throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [
    CommonModule,
    NgxScannerQrcodeComponent,
    PageHeaderComponent,
    HttpClientModule
  ],
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements AfterViewInit {
  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;
  scannedResult: string | null = null;
  isValid = false;

  // video config to use back camera
  config = {
    constraints: {
      video: { facingMode: { ideal: 'environment' } }
    }
  };

  constructor(private http: HttpClient) {
    // load the WASM for the QR lib
    LOAD_WASM().subscribe();
  }

  ngAfterViewInit(): void {
    this.scanner.data
      .pipe(
        // only if we actually read something
        filter((res: ScannerQRCodeResult[]) => res?.length > 0),
        // throttle to 1 event per second
        throttleTime(1000)
      )
      .subscribe((res: ScannerQRCodeResult[]) => {
        const token = res[0].value;
        console.log('Scanned QR code value:', token);

        // call your backend to verify the token
        this.http
          .post<{ valid: boolean }>(
            'https://studivent-dhbw.de/api/tickets/validate',
            { "code": token },
            {
              headers: { 'x-api-key': 'miwses-fIxnaf-5jinfy' }
            }
          )
          .subscribe(
            resp => {
              if (resp.valid) {
                console.log('✅ Token valid:', token);
                this.isValid = true;
                this.scannedResult = token;
                // if you want to stop scanning after a successful verify:
                // this.scanner.stop();
              } else {
                console.warn('❌ Invalid token:', token);
                this.isValid = false;
              }
            },
            err => {
              console.error('Error verifying token:', err);
            }
          );
      });
  }

  toggle(): void {
    // start / stop scanner manually
    if (this.scanner.isStart) {
      this.scanner.stop();
    } else {
      this.scanner.start();
    }
  }
}
