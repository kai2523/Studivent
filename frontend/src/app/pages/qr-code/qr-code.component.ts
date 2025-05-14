import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ZxingWrapperModule } from './zxing-wrapper.module';


@Component({
  selector: 'app-qr-code',
  imports: [PageHeaderComponent, ZxingWrapperModule],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss'
})
export class QrCodeComponent {
  scannedResult: string | null = null;

  onCodeResult(result: string): void {
    this.scannedResult = result;
  }

}
