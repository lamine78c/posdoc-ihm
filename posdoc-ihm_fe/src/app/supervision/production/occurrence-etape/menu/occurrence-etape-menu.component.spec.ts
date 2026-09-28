import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceEtapeMenuComponent } from './occurrence-etape-menu.component';

describe('OccurrenceEtapeMenuComponent', () => {
  let component: OccurrenceEtapeMenuComponent;
  let fixture: ComponentFixture<OccurrenceEtapeMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OccurrenceEtapeMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceEtapeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
