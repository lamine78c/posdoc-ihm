import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutonsRadioLabelComponent } from './boutons-radio-label.component';

describe('BoutonsRadioLabelComponent', () => {
  let component: BoutonsRadioLabelComponent;
  let fixture: ComponentFixture<BoutonsRadioLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoutonsRadioLabelComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoutonsRadioLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
