import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectFloatingFilterComponent } from './multi-select-floating-filter.component';

xdescribe('MultiSelectFloatingFilterComponent', () => {
  let component: MultiSelectFloatingFilterComponent;
  let fixture: ComponentFixture<MultiSelectFloatingFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiSelectFloatingFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiSelectFloatingFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
