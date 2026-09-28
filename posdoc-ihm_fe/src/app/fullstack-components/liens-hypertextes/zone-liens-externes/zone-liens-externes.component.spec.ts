import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneLiensExternesComponent } from './zone-liens-externes.component';

describe('ZoneLiensExternesComponent', () => {
  let component: ZoneLiensExternesComponent;
  let fixture: ComponentFixture<ZoneLiensExternesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZoneLiensExternesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ZoneLiensExternesComponent);
    component = fixture.componentInstance;
    component.links = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
