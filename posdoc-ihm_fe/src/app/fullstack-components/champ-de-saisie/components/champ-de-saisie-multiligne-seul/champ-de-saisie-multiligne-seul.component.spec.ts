import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import { ChampDeSaisieMultiligneSeulComponent } from './champ-de-saisie-multiligne-seul.component';

describe('ChampDeSaisieMultiligneSeulComponent', () => {
  let component: ChampDeSaisieMultiligneSeulComponent;
  let fixture: ComponentFixture<ChampDeSaisieMultiligneSeulComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChampDeSaisieMultiligneSeulComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampDeSaisieMultiligneSeulComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.form = fb.group({ text: [null, null] }).get('text') as FormControl;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
