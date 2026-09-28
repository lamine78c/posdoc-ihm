import { TestBed } from '@angular/core/testing';

import { ChampDeSaisieDateService } from './champ-de-saisie-date.service';

describe('ChampDeSaisieDateService', () => {
  let service: ChampDeSaisieDateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChampDeSaisieDateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
