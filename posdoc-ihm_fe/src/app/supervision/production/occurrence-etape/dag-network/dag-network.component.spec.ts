import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DagNetworkComponent } from './dag-network.component';

describe('DagNetworkComponent', () => {
  let component: DagNetworkComponent;
  let fixture: ComponentFixture<DagNetworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DagNetworkComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DagNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
