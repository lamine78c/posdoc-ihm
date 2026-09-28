import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { TableauFormattersComparatorsService } from './tableau-formatters-comparators.service';

describe('TableauFormattersComparatorsService', () => {
  let service: TableauFormattersComparatorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatePipe],
    });
    service = TestBed.inject(TableauFormattersComparatorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
