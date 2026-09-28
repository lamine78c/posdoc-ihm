import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDistributionImprimeComponent } from './search-distribution-imprime.component';
import { FormBuilder } from '@angular/forms';

describe('SearchDistributionImprimeComponent', () => {
  let component: SearchDistributionImprimeComponent;
  let fixture: ComponentFixture<SearchDistributionImprimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchDistributionImprimeComponent],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchDistributionImprimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.controls['filtre']).toBeTruthy();
  });
});
