import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { InterrupteurSelectEditorComponent } from './interrupteur-select-editor.component';

xdescribe('InterrupteurSelectEditorComponent', () => {
  let component: InterrupteurSelectEditorComponent;
  let fixture: ComponentFixture<InterrupteurSelectEditorComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InterrupteurSelectEditorComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterrupteurSelectEditorComponent);
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
