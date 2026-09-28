import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { ArborescenceChildrenComponent } from './arborescence-children.component';

describe('ArborescenceChildrenComponent', () => {
  let component: ArborescenceChildrenComponent;
  let fixture: ComponentFixture<ArborescenceChildrenComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArborescenceChildrenComponent],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(ArborescenceChildrenComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.formGroup = fb.group({
      '0': [null, null],
    });
    component.tree = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
