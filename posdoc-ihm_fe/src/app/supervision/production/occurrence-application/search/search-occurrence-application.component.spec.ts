import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchOccurrenceApplicationComponent } from './search-occurrence-application.component';

xdescribe('SearchDocumentDematerialiseComponent', () => {
  let component: SearchOccurrenceApplicationComponent;
  let fixture: ComponentFixture<SearchOccurrenceApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchOccurrenceApplicationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchOccurrenceApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
