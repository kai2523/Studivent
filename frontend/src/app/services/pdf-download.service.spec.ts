import { TestBed } from '@angular/core/testing';

import { PdfDownloadService } from './pdf-download.service';

describe('PdfDownloadService', () => {
  let service: PdfDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
