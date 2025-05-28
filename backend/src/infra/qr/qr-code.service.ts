import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async png(data: string): Promise<Buffer> {
    return await QRCode.toBuffer(data, {
      width: 300,
      errorCorrectionLevel: 'M',
    });
  }
}
