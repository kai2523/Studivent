import { NgModule } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@NgModule({
  exports: [ZXingScannerModule]
})
export class ZxingWrapperModule {}