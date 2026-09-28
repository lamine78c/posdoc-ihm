import { TestBed } from '@angular/core/testing';

import { TableauErrorsService } from './tableau-errors.service';

describe('TableauErrorsService', () => {
  let service: TableauErrorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauErrorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
