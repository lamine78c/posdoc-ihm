import { TestBed } from '@angular/core/testing';

import { ArborescenceService } from './arborescence.service';

describe('ArborescenceService', () => {
  let service: ArborescenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArborescenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
