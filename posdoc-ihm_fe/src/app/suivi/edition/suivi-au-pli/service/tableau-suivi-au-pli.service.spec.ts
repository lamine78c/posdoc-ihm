import { TestBed } from '@angular/core/testing';

import { TableauSuiviAuPliService } from './tableau-suivi-au-pli.service';

describe('TableauSuiviAuPliService', () => {
  let service: TableauSuiviAuPliService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauSuiviAuPliService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
