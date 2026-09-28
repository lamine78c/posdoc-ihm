import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutonChoixMultiplesComponent } from './bouton-choix-multiples.component';

describe('BoutonChoixMultiplesComponent', () => {
  let component: BoutonChoixMultiplesComponent;
  let fixture: ComponentFixture<BoutonChoixMultiplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoutonChoixMultiplesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoutonChoixMultiplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
