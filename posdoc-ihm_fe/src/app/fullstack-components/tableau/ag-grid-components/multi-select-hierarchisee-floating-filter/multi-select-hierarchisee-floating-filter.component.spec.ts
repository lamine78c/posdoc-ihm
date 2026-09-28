import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiSelectHierarchiseeFloatingFilterComponent } from './multi-select-hierarchisee-floating-filter.component';

xdescribe('MultiSelectFloatingFilterComponent', () => {
  let component: MultiSelectHierarchiseeFloatingFilterComponent;
  let fixture: ComponentFixture<MultiSelectHierarchiseeFloatingFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiSelectHierarchiseeFloatingFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiSelectHierarchiseeFloatingFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
