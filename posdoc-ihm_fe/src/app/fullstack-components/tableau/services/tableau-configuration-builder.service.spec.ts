import { TestBed } from '@angular/core/testing';

import { TableauConfigurationBuilderService } from './tableau-configuration-builder.service';

describe('TableauConfigurationBuilderService', () => {
  let service: TableauConfigurationBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauConfigurationBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
