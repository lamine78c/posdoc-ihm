import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { InputFilterComponent } from './input-filter.component';

describe('InputFilterComponent', () => {
  let component: InputFilterComponent;
  let fixture: ComponentFixture<InputFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputFilterComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFilterComponent);
    component = fixture.componentInstance;
    component.params = { currentParentModel: () => {} } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
