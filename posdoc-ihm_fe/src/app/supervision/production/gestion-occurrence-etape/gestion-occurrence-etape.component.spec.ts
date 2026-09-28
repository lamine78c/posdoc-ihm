import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionOccurrenceEtapeComponent } from './gestion-occurrence-etape.component';

describe('GestionOccurrenceEtapeComponent', () => {
  let component: GestionOccurrenceEtapeComponent;
  let fixture: ComponentFixture<GestionOccurrenceEtapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionOccurrenceEtapeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionOccurrenceEtapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
