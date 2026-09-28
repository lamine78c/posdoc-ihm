import { TestBed } from '@angular/core/testing';

import { ColumnsConfigurationService } from './columns-configuration.service';

describe('ColumnsConfigurationService', () => {
  let service: ColumnsConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColumnsConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
