import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { InterrupteurSimpleComponent } from './interrupteur-simple.component';

describe('InterrupteurSimpleComponent', () => {
  let component: InterrupteurSimpleComponent;
  let fixture: ComponentFixture<InterrupteurSimpleComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InterrupteurSimpleComponent],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(InterrupteurSimpleComponent);
    fb = TestBed.inject(FormBuilder);
    component = fixture.componentInstance;
    component.form = fb.control(null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
