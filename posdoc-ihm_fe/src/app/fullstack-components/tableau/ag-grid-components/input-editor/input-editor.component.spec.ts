import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { InputEditorComponent } from './input-editor.component';

xdescribe('InputEditorComponent', () => {
  let component: InputEditorComponent;
  let fixture: ComponentFixture<InputEditorComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputEditorComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputEditorComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.params = { value: null, node: { asyncErrors: null } } as any;
    component.form = fb.group({
      input: [null, null],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
