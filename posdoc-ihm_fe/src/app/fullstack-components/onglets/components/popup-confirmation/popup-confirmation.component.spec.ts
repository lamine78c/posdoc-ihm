import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { PopupConfirmationComponent } from './popup-confirmation.component';

describe('PopupConfirmationComponent', () => {
  let component: PopupConfirmationComponent;
  let fixture: ComponentFixture<PopupConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopupConfirmationComponent],
      providers: [NgbActiveModal],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
