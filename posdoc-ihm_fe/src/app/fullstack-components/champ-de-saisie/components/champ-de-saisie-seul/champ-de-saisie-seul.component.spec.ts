import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import { ChampDeSaisieSeulComponent } from './champ-de-saisie-seul.component';

describe('ChampDeSaisieSeulComponent', () => {
  let component: ChampDeSaisieSeulComponent;
  let fixture: ComponentFixture<ChampDeSaisieSeulComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChampDeSaisieSeulComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampDeSaisieSeulComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.form = fb.group({ text: [null, null] }).get('text') as FormControl;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
