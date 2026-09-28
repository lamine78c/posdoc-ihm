import { TestBed } from '@angular/core/testing';

import { NumericalAmountService } from './numerical-amount.service';

describe('NumericalAmountService', () => {
  let service: NumericalAmountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NumericalAmountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
