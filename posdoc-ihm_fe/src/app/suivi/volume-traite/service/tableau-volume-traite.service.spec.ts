import { TestBed } from '@angular/core/testing';

import { TableauVolumeTraiteService } from './tableau-volume-traite.service';

describe('TableauVolumeTraiteService', () => {
  let service: TableauVolumeTraiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauVolumeTraiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
