import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import { InterrupteurLitteralComponent } from './interrupteur-litteral.component';

describe('InterrupteurLitteralComponent', () => {
  let component: InterrupteurLitteralComponent;
  let fixture: ComponentFixture<InterrupteurLitteralComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InterrupteurLitteralComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterrupteurLitteralComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.form = fb
      .group({
        switch: [null, null],
      })
      .get('switch') as FormControl;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
