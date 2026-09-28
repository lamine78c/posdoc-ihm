import { TestBed } from '@angular/core/testing';
import { TableauDocDematerialisesFichierService } from './tableau-doc-dematerialises-fichier.service';

describe('TableauDocDematerialisesFichierService', () => {
  let service: TableauDocDematerialisesFichierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableauDocDematerialisesFichierService],
    });

    service = TestBed.inject(TableauDocDematerialisesFichierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOverlayNoRowsTemplate', () => {
    it('should return correct no rows template', () => {
      const result = service.getOverlayNoRowsTemplate();
      expect(result).toBe('<span class="no-rows"><b>Aucun document dématérialisé trouvé</b></span>');
    });

    it('should return HTML string with correct CSS class', () => {
      const result = service.getOverlayNoRowsTemplate();
      expect(result).toContain('class="no-rows"');
      expect(result).toContain('<span');
      expect(result).toContain('</span>');
    });
  });

  describe('getColumnDefs', () => {
    it('should include identification colum nwith correct configuration', () => {
      const cols = service.getColumnDefs();
      const identificationCol = cols.find(col => col.field === 'numdem');

      expect(identificationCol).toBeTruthy();
      expect(identificationCol.headerName).toBe('Identification');
      expect(identificationCol.sort).toBe('asc');
      expect(identificationCol.filter).toBe('agTextColumnFilter');
    });

    it('should include document column with correct configuration', () => {
      const cols = service.getColumnDefs();
      const documentCol = cols.find(col => col.field === 'coddoc');

      expect(documentCol).toBeTruthy();
      expect(documentCol.headerName).toBe('Document');
      expect(documentCol.filter).toBe('agSetColumnFilter');
    });

    it('should include reference column with correct configuration', () => {
      const cols = service.getColumnDefs();
      const referenceCol = cols.find(col => col.field === 'refdem');

      expect(referenceCol).toBeTruthy();
      expect(referenceCol.headerName).toBe('Réf. demande');
      expect(referenceCol.filter).toBe('agTextColumnFilter');
    });

    it('should include type column with correct configuration', () => {
      const cols = service.getColumnDefs();
      const typeCol = cols.find(col => col.field === 'typact');

      expect(typeCol).toBeTruthy();
      expect(typeCol.headerName).toBe('Type');
      expect(typeCol.filter).toBe('agSetColumnFilter');
    });

    it('should include date début column with correct configuration', () => {
      const cols = service.getColumnDefs();
      const dateDebCol = cols.find(col => col.field === 'ddodeb');

      expect(dateDebCol).toBeTruthy();
      expect(dateDebCol.headerName).toBe('Date début');
      expect(dateDebCol.filter).toBe('agTextColumnFilter');
    });

    it('should include date fin column with correct configuration', () => {
      const cols = service.getColumnDefs();
      const dateFinCol = cols.find(col => col.field === 'ddofin');

      expect(dateFinCol).toBeTruthy();
      expect(dateFinCol.headerName).toBe('Date fin');
      expect(dateFinCol.filter).toBe('agTextColumnFilter');
    });
  });
});
