import { TestBed } from '@angular/core/testing';

import { FormattersService } from './formatters.service';

describe('FormattersService', () => {
  let service: FormattersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormattersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
