import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupConfirmationComponent } from './popup-confirmation.component';

xdescribe('PopupConfirmationComponent', () => {
  let component: PopupConfirmationComponent;
  let fixture: ComponentFixture<PopupConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopupConfirmationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
