import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUserPermissionComponent } from './dialog-user-permission.component';

describe('DialogUserPermissionComponent', () => {
  let component: DialogUserPermissionComponent;
  let fixture: ComponentFixture<DialogUserPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogUserPermissionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogUserPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
