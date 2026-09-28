import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneInformationComponent } from './zone-information.component';

describe('ZoneInformationComponent', () => {
  let component: ZoneInformationComponent;
  let fixture: ComponentFixture<ZoneInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZoneInformationComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoneInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
