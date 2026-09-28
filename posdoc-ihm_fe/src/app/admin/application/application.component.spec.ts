import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationComponent } from './application.component';

xdescribe('ApplicationComponent', () => {
  let component: ApplicationComponent;
  let fixture: ComponentFixture<ApplicationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
