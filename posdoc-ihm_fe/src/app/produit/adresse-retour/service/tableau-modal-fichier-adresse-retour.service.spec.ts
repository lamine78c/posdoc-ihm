import { TestBed } from '@angular/core/testing';

import { TableauModalFichierAdresseRetourService } from './tableau-modal-fichier-adresse-retour.service';

describe('TableauModalFichierAdresseRetourService', () => {
  let service: TableauModalFichierAdresseRetourService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauModalFichierAdresseRetourService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct no rows template', () => {
    const result = service.getOverlayNoRowsTemplate();
    expect(result).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('main columns with definition validity', () => {
    const result = service.getColumnDefs();
    expect(result.length).toEqual(7);
  });
});
