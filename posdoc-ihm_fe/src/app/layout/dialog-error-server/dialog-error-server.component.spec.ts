import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogErrorServerComponent } from './dialog-error-server.component';

xdescribe('DialogErrorServerComponent', () => {
  let component: DialogErrorServerComponent;
  let fixture: ComponentFixture<DialogErrorServerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogErrorServerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogErrorServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
