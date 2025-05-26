// Angular single‑file demo app using ngx‑scanner‑qrcode (Angular 16)
// ------------------------------------------------------------------
// Abhängigkeiten installieren:
//   npm install ngx-scanner-qrcode@1.6.9 @angular/core @angular/platform-browser
//
// Assets‑Eintrag (angular.json):
//   {
//     "glob": "*/",
//     "input": "node_modules/ngx-scanner-qrcode/wasm/",
//     "output": "./assets/wasm/"
//   }
// ------------------------------------------------------------------

import { AfterViewInit, Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {
  NgxScannerQrcodeModule,
  ScannerQRCodeResult,
  ScannerQRCodeConfig,
  LOAD_WASM
} from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-root',
  styles: [
    `
      .title {
        text-align: center;
        margin: 1rem 0;
      }
      ngx-scanner-qrcode {
        display: block;
        width: 100%;
        max-width: 640px;
        margin: 0 auto;
      }
      .controls {
        text-align: center;
        margin: 1rem 0;
      }
      button {
        margin: 0 0.5rem;
        padding: 0.5rem 1rem;
      }
    `
  ],
  template: `
    <h2 class="title">Angular QR Code Scanner (ngx‑scanner‑qrcode)</h2>

    <ngx-scanner-qrcode
      #scanner="scanner"
      [config]="config">
    </ngx-scanner-qrcode>

    <div class="controls">
      <button (click)="toggle()">
        {{ scanner?.isStart ? 'Stop' : 'Start' }}
      </button>

      <button *ngIf="scanner?.isTorch" (click)="scanner.torcher()">
        Toggle Flash
      </button>
    </div>

    <pre *ngIf="result">{{ result | json }}</pre>
    <p *ngIf="scanner?.isLoading">⌛ Initialising camera stream…</p>
  `
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('scanner', { static: false }) scanner: any;

  result: ScannerQRCodeResult | null = null;

  // Minimale Konfiguration – zusätzliche Optionen nach Bedarf
  config: Partial<ScannerQRCodeConfig> = {
    constraints: {
      video: {
        facingMode: { ideal: 'environment' }
      }
    }
  };

  ngOnInit(): void {
    // WebAssembly‑Modul vorab laden (nutzt Standardpfad /assets/wasm/...)
    LOAD_WASM().subscribe();
  }

  ngAfterViewInit(): void {
    // QR‑Ergebnisse überwachen
    this.scanner.data.subscribe((res: ScannerQRCodeResult[]) => {
      if (res?.length) {
        this.result = res[0];
      }
    });
  }

  toggle(): void {
    if (!this.scanner) return;
    this.scanner.isStart ? this.scanner.stop() : this.scanner.start();
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxScannerQrcodeModule],
  bootstrap: [AppComponent]
})
export class AppModule {}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));