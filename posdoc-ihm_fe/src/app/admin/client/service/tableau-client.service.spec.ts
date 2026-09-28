import { TestBed } from '@angular/core/testing';

import { TableauClientService } from './tableau-client.service';

describe('TableauClientService', () => {
  let service: TableauClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
