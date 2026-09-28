import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OngletHeaderComponent } from './onglet-header.component';

describe('OngletHeaderComponent', () => {
  let component: OngletHeaderComponent;
  let fixture: ComponentFixture<OngletHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OngletHeaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OngletHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
