import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionComponent } from './production.component';

xdescribe('ProductionComponent', () => {
  let component: ProductionComponent;
  let fixture: ComponentFixture<ProductionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProductionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
