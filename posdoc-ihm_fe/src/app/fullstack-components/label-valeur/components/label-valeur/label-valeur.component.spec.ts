import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelValeurComponent } from './label-valeur.component';

describe('LabelValeurComponent', () => {
  let component: LabelValeurComponent;
  let fixture: ComponentFixture<LabelValeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabelValeurComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelValeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
