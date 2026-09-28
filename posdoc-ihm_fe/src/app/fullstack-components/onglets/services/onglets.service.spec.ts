import { TestBed } from '@angular/core/testing';

import { OngletsService } from './onglets.service';

describe('OngletsService', () => {
  let service: OngletsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OngletsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
