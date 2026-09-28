import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DatePickerComponent } from './date-picker.component';

xdescribe('DatePickerComponent', () => {
  let component: DatePickerComponent;
  let fixture: ComponentFixture<DatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatePickerComponent],
      imports: [ReactiveFormsModule, NgbModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    component.currentDate = new FormControl(null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
