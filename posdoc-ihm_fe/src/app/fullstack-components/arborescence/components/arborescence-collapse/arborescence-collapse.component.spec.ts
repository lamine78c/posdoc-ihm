import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ArborescenceCollapseComponent } from './arborescence-collapse.component';

describe('ArborescenceCollapseComponent', () => {
  let component: ArborescenceCollapseComponent;
  let fixture: ComponentFixture<ArborescenceCollapseComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArborescenceCollapseComponent],
      imports: [NgbModule],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(ArborescenceCollapseComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.tree = [{ id: 1, text: 'text', value: null }];
    component.index = 0;
    component.formGroup = fb.group({
      '0': [null, null],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
