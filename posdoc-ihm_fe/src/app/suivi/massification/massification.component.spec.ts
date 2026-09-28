import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MassificationComponent } from './massification.component';

xdescribe('MassificationComponent', () => {
  let component: MassificationComponent;
  let fixture: ComponentFixture<MassificationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MassificationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
