import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CereusComponent } from './cereus.component';

xdescribe('CereusComponent', () => {
  let component: CereusComponent;
  let fixture: ComponentFixture<CereusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CereusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CereusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
