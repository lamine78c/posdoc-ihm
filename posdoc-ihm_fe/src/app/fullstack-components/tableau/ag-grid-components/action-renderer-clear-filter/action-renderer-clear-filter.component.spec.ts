import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionRendererClearFilterComponent } from './action-renderer-clear-filter.component';

describe('ActionRendererClearFilterComponent', () => {
  let component: ActionRendererClearFilterComponent;
  let fixture: ComponentFixture<ActionRendererClearFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActionRendererClearFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionRendererClearFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
