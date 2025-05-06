import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleViewComponent } from './toggle-view.component';

describe('ToggleViewComponent', () => {
  let component: ToggleViewComponent;
  let fixture: ComponentFixture<ToggleViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToggleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
