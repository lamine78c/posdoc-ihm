import { TestBed } from '@angular/core/testing';

import { TableauActionService } from './tableau-action.service';

xdescribe('TableauActionService', () => {
  let service: TableauActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
