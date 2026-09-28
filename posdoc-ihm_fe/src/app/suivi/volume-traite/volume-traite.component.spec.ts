import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeTraiteComponent } from './volume-traite.component';

xdescribe('VolumeTraiteComponent', () => {
  let component: VolumeTraiteComponent;
  let fixture: ComponentFixture<VolumeTraiteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VolumeTraiteComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeTraiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
