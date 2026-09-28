import { TestBed } from '@angular/core/testing';

import { ListeDeroulanteService } from './liste-deroulante.service';

describe('ListeDeroulanteService', () => {
  let service: ListeDeroulanteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListeDeroulanteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
