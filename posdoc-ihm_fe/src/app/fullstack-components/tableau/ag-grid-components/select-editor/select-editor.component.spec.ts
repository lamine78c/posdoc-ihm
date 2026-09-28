import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { SelectEditorComponent } from './select-editor.component';

xdescribe('SelectEditorComponent', () => {
  let component: SelectEditorComponent;
  let fixture: ComponentFixture<SelectEditorComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectEditorComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectEditorComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.params = { value: null, node: { asyncErrors: null } } as any;
    component.form = fb.group({
      select: [null, null],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
