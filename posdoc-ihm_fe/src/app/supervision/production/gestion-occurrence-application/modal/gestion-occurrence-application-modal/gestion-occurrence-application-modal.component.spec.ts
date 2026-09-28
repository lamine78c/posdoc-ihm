import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { GestionOccurrenceApplicationModalComponent } from './gestion-occurrence-application-modal.component';

describe('GestionOccurrenceApplicationModalComponent', () => {
  let component: GestionOccurrenceApplicationModalComponent;
  let fixture: ComponentFixture<GestionOccurrenceApplicationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionOccurrenceApplicationModalComponent],
      providers: [NgbActiveModal],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionOccurrenceApplicationModalComponent);
    component = fixture.componentInstance;
  });

  it('should create the modal', () => {
    const fixture = TestBed.createComponent(GestionOccurrenceApplicationModalComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
