import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardComponent } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WizardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    component.disableLeftNavigation = true;
    component.disableRightNavigation = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
