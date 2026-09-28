import { TestBed } from '@angular/core/testing';

import { CommunicationAdresseRetourService } from './communication-adresse-retour.service';

describe('CommunicationAdresseRetourService', () => {
  let service: CommunicationAdresseRetourService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunicationAdresseRetourService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
