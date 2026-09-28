import { TestBed } from '@angular/core/testing';

import { TableauApplicationDefinitionService } from './tableau-application-definition.service';

xdescribe('TableauApplicationDefinitionService', () => {
  let service: TableauApplicationDefinitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauApplicationDefinitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
