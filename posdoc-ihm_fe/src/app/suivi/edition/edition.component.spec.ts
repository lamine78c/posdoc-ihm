import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionComponent } from './edition.component';

xdescribe('EditionComponent', () => {
  let component: EditionComponent;
  let fixture: ComponentFixture<EditionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EditionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
