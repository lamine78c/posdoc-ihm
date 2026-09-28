import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { ChampDeSaisieComponent } from './champ-de-saisie.component';

describe('ChampDeSaisieComponent', () => {
  let component: ChampDeSaisieComponent;
  let fixture: ComponentFixture<ChampDeSaisieComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChampDeSaisieComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampDeSaisieComponent);
    fb = TestBed.inject(FormBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
