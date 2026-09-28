import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ColonnesConfigPopupComponent } from './colonnes-config-popup.component';

describe('ColonnesConfigPopupComponent', () => {
  let component: ColonnesConfigPopupComponent;
  let fixture: ComponentFixture<ColonnesConfigPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ColonnesConfigPopupComponent],
      providers: [NgbActiveModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ColonnesConfigPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
