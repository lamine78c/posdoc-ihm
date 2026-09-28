import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchActionComponent } from './search-action.component';

xdescribe('SearchActionComponent', () => {
  let component: SearchActionComponent;
  let fixture: ComponentFixture<SearchActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchActionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
