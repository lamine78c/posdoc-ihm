import { TestBed } from '@angular/core/testing';
import { TableauFaqService } from './tableau-faq.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef } from 'ag-grid-community';

describe('TableauFaqService', () => {
  let service: TableauFaqService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;

  beforeEach(() => {
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    mockTableauUtilService.getColsDefAction.and.returnValue([]);

    TestBed.configureTestingModule({
      providers: [
        TableauFaqService,
        { provide: TableauUtilService, useValue: mockTableauUtilService },
      ],
    });
    service = TestBed.inject(TableauFaqService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getColumnDefs', () => {
    it('should return column definitions', () => {
      const columnDefs = service.getColumnDefs(false);

      expect(columnDefs).toBeDefined();
      expect(Array.isArray(columnDefs)).toBe(true);
    });

    it('should call getColsDefAction from TableauUtilService', () => {
      service.getColumnDefs(false);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalled();
    });

    it('should include status column', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const statusColumn = columnDefs.find(col => (col as ColDef).field === 'status');

      expect(statusColumn).toBeDefined();
      expect((statusColumn as ColDef).headerName).toBe('Statut');
    });

    it('should include pathLabel column', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const pathColumn = columnDefs.find(col => (col as ColDef).field === 'pathLabel');

      expect(pathColumn).toBeDefined();
      expect((pathColumn as ColDef).headerName).toBe('Page');
    });

    it('should include question column', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const questionColumn = columnDefs.find(col => (col as ColDef).field === 'question');

      expect(questionColumn).toBeDefined();
      expect((questionColumn as ColDef).headerName).toBe('Question');
    });

    it('should include answer column', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const answerColumn = columnDefs.find(col => (col as ColDef).field === 'answer');

      expect(answerColumn).toBeDefined();
      expect((answerColumn as ColDef).headerName).toBe('Réponse');
    });

    it('should include viewCount column', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const viewCountColumn = columnDefs.find(col => (col as ColDef).field === 'viewCount');

      expect(viewCountColumn).toBeDefined();
      expect((viewCountColumn as ColDef).headerName).toBe('Nb. lectures');
    });

    it('should include updatedBy column', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const updatedByColumn = columnDefs.find(col => (col as ColDef).field === 'updatedBy');

      expect(updatedByColumn).toBeDefined();
      expect((updatedByColumn as ColDef).headerName).toBe('Modifié par');
    });

    it('should include updatedAt column', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const updatedAtColumn = columnDefs.find(col => (col as ColDef).field === 'updatedAt');

      expect(updatedAtColumn).toBeDefined();
      expect((updatedAtColumn as ColDef).headerName).toBe('Date modification');
    });
  });

  describe('getOverlayNoRowsTemplate', () => {
    it('should return no rows template', () => {
      const template = service.getOverlayNoRowsTemplate();

      expect(template).toBeDefined();
      expect(template).toContain('Aucun résultat');
    });
  });

  describe('status column', () => {
    it('should have floating filter with correct status options', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const statusColumn = columnDefs.find(col => (col as ColDef).field === 'status') as ColDef;

      expect(statusColumn.floatingFilterComponentParams).toBeDefined();
      expect(statusColumn.floatingFilterComponentParams.possibleLabelWithValues).toEqual([
        { label: 'Brouillon', value: 'draft' },
        { label: 'Activé', value: 'enabled' },
        { label: 'Désactivé', value: 'disabled' },
      ]);
    });
  });

  describe('answer column cell renderer', () => {
    it('should display "Aucune réponse" for null answer', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const answerColumn = columnDefs.find(col => (col as ColDef).field === 'answer') as ColDef;

      const container = answerColumn.cellRenderer!({ value: null } as any);

      expect(container.textContent).toBe('Aucune réponse');
      expect(container.style.fontStyle).toBe('italic');
      expect(container.style.color).toBe('rgb(153, 153, 153)');
    });

    it('should display answer text when value is present', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const answerColumn = columnDefs.find(col => (col as ColDef).field === 'answer') as ColDef;

      const testAnswer = 'This is a test answer';
      const container = answerColumn.cellRenderer!({ value: testAnswer } as any);

      expect(container.textContent).toBe(testAnswer);
    });

    it('should truncate long HTML answers', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const answerColumn = columnDefs.find(col => (col as ColDef).field === 'answer') as ColDef;

      const longAnswer = '<p>' + 'a'.repeat(200) + '</p>';
      const container = answerColumn.cellRenderer!({ value: longAnswer } as any);

      expect(container.textContent?.length).toBeLessThan(longAnswer.length);
      expect(container.textContent).toContain('...');
    });
  });

  describe('updatedAt column', () => {
    it('should format date correctly', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const updatedAtColumn = columnDefs.find(col => (col as ColDef).field === 'updatedAt') as ColDef;

      const testDate = '2024-11-20T14:30:00';
      const formatter = updatedAtColumn.valueFormatter as any;
      const formattedDate = formatter({ value: testDate });

      expect(formattedDate).toContain('20/11/2024');
      expect(formattedDate).toContain('14:30');
    });

    it('should return empty string for null date', () => {
      const columnDefs = service.getColumnDefs(false) as ColDef[];
      const updatedAtColumn = columnDefs.find(col => (col as ColDef).field === 'updatedAt') as ColDef;

      const formatter = updatedAtColumn.valueFormatter as any;
      const formattedDate = formatter({ value: null });

      expect(formattedDate).toBe('');
    });
  });
});
