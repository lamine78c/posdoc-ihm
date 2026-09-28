import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { ChampDeSaisieDateIntervalleComponent } from './champ-de-saisie-date-intervalle.component';

describe('ChampDeSaisieDateIntervalleComponent', () => {
  let component: ChampDeSaisieDateIntervalleComponent;
  let fb: FormBuilder;
  let fixture: ComponentFixture<ChampDeSaisieDateIntervalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChampDeSaisieDateIntervalleComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampDeSaisieDateIntervalleComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    component.formFrom = fb.control(null);
    component.formTo = fb.control(null);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
