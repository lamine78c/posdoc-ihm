import { TestBed } from '@angular/core/testing';
import { TableauNoticesFichierService } from './tableau-notices-fichier.service';

describe('TableauNoticesFichierService', () => {
  let service: TableauNoticesFichierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableauNoticesFichierService],
    });

    service = TestBed.inject(TableauNoticesFichierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOverlayNoRowsTemplate', () => {
    it('should return correct no rows template', () => {
      const result = service.getOverlayNoRowsTemplate();
      expect(result).toBe('<span class="no-rows">Aucune notice</span>');
    });

    it('should return HTML string with correct CSS class', () => {
      const result = service.getOverlayNoRowsTemplate();
      expect(result).toContain('class="no-rows"');
      expect(result).toContain('<span');
      expect(result).toContain('</span>');
    });
  });

  describe('getColumnDefs', () => {
    it('should include notice column with correct configuration', () => {
      const cols = service.getColumnDefs();
      const identificationCol = cols.find(col => col.field === 'codnot');

      expect(identificationCol).toBeTruthy();
      expect(identificationCol.headerName).toBe('Notice');
      expect(identificationCol.sort).toBe('asc');
      expect(identificationCol.filter).toBe('agTextColumnFilter');
    });

    it('should include poids column with correct configuration', () => {
      const cols = service.getColumnDefs();
      const identificationCol = cols.find(col => col.field === 'poinot');

      expect(identificationCol).toBeTruthy();
      expect(identificationCol.headerName).toBe('Poids');
      expect(identificationCol.filter).toBe('agTextColumnFilter');
    });

    it('should include format column with correct configuration', () => {
      const cols = service.getColumnDefs();
      const identificationCol = cols.find(col => col.field === 'fornot');

      expect(identificationCol).toBeTruthy();
      expect(identificationCol.headerName).toBe('Format');
      expect(identificationCol.filter).toBe('agSetColumnFilter');
    });

    it('should include portée column with correct configuration', () => {
      const cols = service.getColumnDefs();
      const identificationCol = cols.find(col => col.field === 'pornot');

      expect(identificationCol).toBeTruthy();
      expect(identificationCol.headerName).toBe('Portée');
      expect(identificationCol.filter).toBe('agSetColumnFilter');
    });

    it('should include désignation column with correct configuration', () => {
      const cols = service.getColumnDefs();
      const identificationCol = cols.find(col => col.field === 'libnot');

      expect(identificationCol).toBeTruthy();
      expect(identificationCol.headerName).toBe('Désignation');
      expect(identificationCol.filter).toBe('agTextColumnFilter');
    });
  });
});
