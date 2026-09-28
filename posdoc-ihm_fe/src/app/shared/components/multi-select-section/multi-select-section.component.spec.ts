import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { MultiSelectSectionComponent } from './multi-select-section.component';

describe('MultiSelectSectionComponent', () => {
  let component: MultiSelectSectionComponent;
  let fixture: ComponentFixture<MultiSelectSectionComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiSelectSectionComponent],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiSelectSectionComponent);
    fb = TestBed.inject(FormBuilder);
    component = fixture.componentInstance;
    component.form = fb.group({
      test: [false, null],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
