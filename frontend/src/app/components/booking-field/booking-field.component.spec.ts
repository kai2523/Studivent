import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingFieldComponent } from './booking-field.component';

describe('BookingFieldComponent', () => {
  let component: BookingFieldComponent;
  let fixture: ComponentFixture<BookingFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
