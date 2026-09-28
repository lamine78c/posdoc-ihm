import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OngletHeaderContainerComponent } from './onglet-header-container.component';

describe('OngletHeaderContainerComponent', () => {
  let component: OngletHeaderContainerComponent;
  let fixture: ComponentFixture<OngletHeaderContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OngletHeaderContainerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OngletHeaderContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
