import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSuiviAuPliComponent } from './search-suivi-au-pli.component';
import { FormBuilder } from '@angular/forms';

describe('SearchSuiviAuPliComponent', () => {
  let component: SearchSuiviAuPliComponent;
  let fixture: ComponentFixture<SearchSuiviAuPliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchSuiviAuPliComponent],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchSuiviAuPliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
