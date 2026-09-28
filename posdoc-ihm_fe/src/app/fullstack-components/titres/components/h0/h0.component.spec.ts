import { ComponentFixture, TestBed } from '@angular/core/testing';

import { H0Component } from './h0.component';

describe('H0Component', () => {
  let component: H0Component;
  let fixture: ComponentFixture<H0Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [H0Component],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(H0Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
