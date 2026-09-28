import { TestBed } from '@angular/core/testing';

import { TableauDetailsMassificationService } from './tableau-details-massification.service';

xdescribe('TableauDetailsMassificationService', () => {
  let service: TableauDetailsMassificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauDetailsMassificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
