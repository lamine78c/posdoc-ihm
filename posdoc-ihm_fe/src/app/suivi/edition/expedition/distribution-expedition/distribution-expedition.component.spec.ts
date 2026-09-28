import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionExpeditionComponent } from './distribution-expedition.component';

xdescribe('DistributionExpeditionComponent', () => {
  let component: DistributionExpeditionComponent;
  let fixture: ComponentFixture<DistributionExpeditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DistributionExpeditionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DistributionExpeditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
