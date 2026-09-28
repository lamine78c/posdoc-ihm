import { TestBed } from '@angular/core/testing';

import { TableauExpeditionService } from './tableau-expedition.service';

describe('TableauExpeditionService', () => {
  let service: TableauExpeditionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauExpeditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
