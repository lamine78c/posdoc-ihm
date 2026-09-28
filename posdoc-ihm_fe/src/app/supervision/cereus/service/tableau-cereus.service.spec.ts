import { TestBed } from '@angular/core/testing';

import { TableauCereusService } from './tableau-cereus.service';

xdescribe('TableauCereusService', () => {
  let service: TableauCereusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauCereusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
