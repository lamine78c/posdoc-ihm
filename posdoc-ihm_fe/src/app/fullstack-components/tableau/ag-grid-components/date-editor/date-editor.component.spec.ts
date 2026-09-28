import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { DateEditorComponent } from './date-editor.component';

xdescribe('DateEditorComponent', () => {
  let component: DateEditorComponent;
  let fixture: ComponentFixture<DateEditorComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateEditorComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateEditorComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.params = { value: null, node: { asyncErrors: null } } as any;
    component.form = fb.group({
      currentDate: [null, null],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
