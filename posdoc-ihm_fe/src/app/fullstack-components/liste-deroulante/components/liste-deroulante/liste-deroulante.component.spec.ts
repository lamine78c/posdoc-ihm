import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { ListeDeroulanteComponent } from './liste-deroulante.component';

xdescribe('ListeDeroulanteComponent', () => {
  let component: ListeDeroulanteComponent;
  let fixture: ComponentFixture<ListeDeroulanteComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeDeroulanteComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeDeroulanteComponent);
    fb = TestBed.inject(FormBuilder);
    component = fixture.componentInstance;

    component.form = fb.control(null);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
