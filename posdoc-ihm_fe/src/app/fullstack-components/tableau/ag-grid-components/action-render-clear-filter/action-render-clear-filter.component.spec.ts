import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionRenderClearFilterComponent } from './action-render-clear-filter.component';

xdescribe('ActionRenderClearFilterComponent', () => {
  let component: ActionRenderClearFilterComponent;
  let fixture: ComponentFixture<ActionRenderClearFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActionRenderClearFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionRenderClearFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
