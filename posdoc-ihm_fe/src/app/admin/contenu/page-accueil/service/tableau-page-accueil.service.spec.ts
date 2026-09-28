import { TestBed } from '@angular/core/testing';
import { DateEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/date-editor/date-editor.component';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { TableauPageAccueilService } from './tableau-page-accueil.service';

describe('TableauPageAccueilService', () => {
  let service: TableauPageAccueilService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockColClearFilter: ColDef;

  beforeEach(() => {
    mockColClearFilter = {
      headerName: 'Clear',
      field: 'clear',
      width: 50
    };

    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColClearFilter']);
    mockTableauUtilService.getColClearFilter.and.returnValue(mockColClearFilter);

    TestBed.configureTestingModule({
      providers: [
        TableauPageAccueilService,
        { provide: TableauUtilService, useValue: mockTableauUtilService }
      ]
    });

    service = TestBed.inject(TableauPageAccueilService);
  });

  describe('Service initialization', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should correctly inject TableauUtilService', () => {
      expect(mockTableauUtilService).toBeTruthy();
    });
  });

  describe('getOverlayNoRowsTemplate()', () => {
    it('should return HTML template for no results', () => {
      const template = service.getOverlayNoRowsTemplate();

      expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
    });
  });

  describe('getColumnDefs()', () => {
    it('should return all columns in correct order', () => {
      const allRegions = ['092', '109', '116'];
      const columnDefs = service.getColumnDefs(allRegions);

      expect(columnDefs).toBeDefined();
      expect(columnDefs.length).toBe(6);
      expect(mockTableauUtilService.getColClearFilter).toHaveBeenCalled();
    });

    it('should include clear filter column first', () => {
      const allRegions = ['092', '109'];
      const columnDefs = service.getColumnDefs(allRegions);

      expect(columnDefs[0]).toBe(mockColClearFilter);
    });

    it('should handle empty regions list', () => {
      const allRegions: string[] = [];
      const columnDefs = service.getColumnDefs(allRegions);

      expect(columnDefs).toBeDefined();
      expect(columnDefs.length).toBe(6);
    });

    it('should handle large regions list', () => {
      const allRegions = Array.from({length: 100}, (_, i) => `${(i + 1).toString().padStart(3, '0')}`);
      const columnDefs = service.getColumnDefs(allRegions);

      expect(columnDefs).toBeDefined();
      expect(columnDefs.length).toBe(6);
    });
  });

  describe('Column configurations', () => {
    let columnDefs: (ColDef | ColGroupDef)[];
    const testRegions = ['092', '109', '116', '117'];

    beforeEach(() => {
      columnDefs = service.getColumnDefs(testRegions);
    });

    describe('Region Column', () => {
      let regionsColDef: ColDef;

      beforeEach(() => {
        regionsColDef = columnDefs[1] as ColDef;
      });

      it('should have correct configuration for region column', () => {
        expect(regionsColDef.headerName).toBe('Région');
        expect(regionsColDef.field).toBe('regions');
        expect(regionsColDef.width).toBe(100);
        expect(regionsColDef.minWidth).toBe(100);
        expect(regionsColDef.maxWidth).toBe(100);
        expect(regionsColDef.sortable).toBe(true);
        expect(regionsColDef.showRowGroup).toBe(true);
        expect(regionsColDef.filter).toBe('agSetColumnFilter');
        expect(regionsColDef.floatingFilter).toBe(true);
        expect(regionsColDef.floatingFilterComponent).toBe('multiSelectFloatingFilter');
      });

      it('should have correct cell styles', () => {
        expect(regionsColDef.cellStyle).toEqual({ display: 'block', 'padding-left': '0' });
      });

      describe('cellRenderer for regions', () => {
        let cellRenderer: Function;

        beforeEach(() => {
          cellRenderer = regionsColDef.cellRenderer as Function;
        });

        it('should display "Tous" when all regions are selected', () => {
          const params = {
            value: ['092', '109', '116', '117']
          };

          const result = cellRenderer(params);

          expect(result).toContain('<b>Tous</b>');
          expect(result).toContain('cell-region');
          expect(result).toContain('app-row-even');
        });

        it('should display individual regions with alternating styles', () => {
          const params = {
            value: ['092', '109']
          };

          const result = cellRenderer(params);

          expect(result).toContain('cell-region');
          expect(result).toContain('app-row-even');
          expect(result).toContain('app-row-odd');
          expect(result).toContain('092');
          expect(result).toContain('109');
          expect(result).not.toContain('<b>Tous</b>');
        });

        it('should sort regions before display', () => {
          const params = {
            value: ['117', '092', '109']
          };

          const result = cellRenderer(params);

          const indexOf092 = result.indexOf('092');
          const indexOf109 = result.indexOf('109');
          const indexOf117 = result.indexOf('117');

          expect(indexOf092).toBeLessThan(indexOf109);
          expect(indexOf109).toBeLessThan(indexOf117);
        });

        it('should handle single region', () => {
          const params = {
            value: ['092']
          };

          const result = cellRenderer(params);

          expect(result).toContain('cell-region');
          expect(result).toContain('app-row-even');
          expect(result).toContain('092');
          expect(result).not.toContain('app-row-odd');
        });

        it('should handle empty regions', () => {
          const params = {
            value: []
          };

          const result = cellRenderer(params);

          expect(result).toContain('cell-region');
          expect(result).not.toContain('app-row-even');
          expect(result).not.toContain('app-row-odd');
        });
      });
    });

    describe('Title Column', () => {
      let titreColDef: ColDef;

      beforeEach(() => {
        titreColDef = columnDefs[2] as ColDef;
      });

      it('should have correct configuration', () => {
        expect(titreColDef.headerName).toBe('Titre');
        expect(titreColDef.field).toBe('titre');
        expect(titreColDef.width).toBe(250);
        expect(titreColDef.minWidth).toBe(250);
        expect(titreColDef.maxWidth).toBe(250);
        expect(titreColDef.sortable).toBe(true);
        expect(titreColDef.showRowGroup).toBe(true);
        expect(titreColDef.filter).toBe('agTextColumnFilter');
        expect(titreColDef.floatingFilter).toBe(true);
        expect(titreColDef.floatingFilterComponent).toBe('inputFilter');
      });
    });

    describe('Activation Date Column', () => {
      let dateActivationColDef: ColDef;

      beforeEach(() => {
        dateActivationColDef = columnDefs[3] as ColDef;
      });

      it('should have correct configuration', () => {
        expect(dateActivationColDef.headerName).toBe('Date Activation');
        expect(dateActivationColDef.field).toBe('dateActivation');
        expect(dateActivationColDef.sortable).toBe(true);
        expect(dateActivationColDef.width).toBe(100);
        expect(dateActivationColDef.minWidth).toBe(100);
        expect(dateActivationColDef.maxWidth).toBe(100);
        expect(dateActivationColDef.cellRenderer).toBe(DateEditorComponent);
        expect(dateActivationColDef.filter).toBe('agDateColumnFilter');
        expect(dateActivationColDef.floatingFilterComponent).toBe('agDateInput');
        expect(dateActivationColDef.floatingFilter).toBe(true);
      });

      it('should have correct cellRenderer parameters', () => {
        const params = dateActivationColDef.cellRendererParams;

        expect(params.formKey).toBe('dateActivation');
        expect(params.ariaLabelErrorIcon).toBe('Icône champ de saisie en erreur');
        expect(params.ariaLabelWarningIcon).toBe('Icône champ de saisie en avertissement');
      });
    });

    describe('Expiration Date Column', () => {
      let dateExpirationColDef: ColDef;

      beforeEach(() => {
        dateExpirationColDef = columnDefs[4] as ColDef;
      });

      it('should have correct configuration', () => {
        expect(dateExpirationColDef.headerName).toBe('Date Expiration');
        expect(dateExpirationColDef.field).toBe('dateExpiration');
        expect(dateExpirationColDef.sortable).toBe(true);
        expect(dateExpirationColDef.width).toBe(100);
        expect(dateExpirationColDef.minWidth).toBe(100);
        expect(dateExpirationColDef.maxWidth).toBe(100);
        expect(dateExpirationColDef.cellRenderer).toBe(DateEditorComponent);
        expect(dateExpirationColDef.filter).toBe('agDateColumnFilter');
        expect(dateExpirationColDef.floatingFilterComponent).toBe('agDateInput');
        expect(dateExpirationColDef.floatingFilter).toBe(true);
      });

      it('should have correct cellRenderer parameters', () => {
        const params = dateExpirationColDef.cellRendererParams;

        expect(params.formKey).toBe('dateExpiration');
        expect(params.ariaLabelErrorIcon).toBe('Icône champ de saisie en erreur');
        expect(params.ariaLabelWarningIcon).toBe('Icône champ de saisie en avertissement');
      });
    });

    describe('Message Column', () => {
      let messageColDef: ColDef;

      beforeEach(() => {
        messageColDef = columnDefs[5] as ColDef;
      });

      it('should have correct configuration', () => {
        expect(messageColDef.headerName).toBe('Message');
        expect(messageColDef.field).toBe('message');
        expect(messageColDef.sortable).toBe(true);
        expect(messageColDef.filter).toBe('agTextColumnFilter');
        expect(messageColDef.wrapText).toBe(true);
        expect(messageColDef.floatingFilter).toBe(true);
        expect(messageColDef.flex).toBe(1);
        expect(messageColDef.floatingFilterComponent).toBe('inputFilter');
        expect(messageColDef.lockPosition).toBe('right');
      });

      it('should have correct cell styles', () => {
        expect(messageColDef.cellStyle).toEqual({ display: 'block', padding: '0.5rem' });
      });

      describe('cellRenderer for message', () => {
        let cellRenderer: Function;

        beforeEach(() => {
          cellRenderer = messageColDef.cellRenderer as Function;
        });

        it('should wrap content in scrollable div', () => {
          const params = {
            value: 'Test message content'
          };

          const result = cellRenderer(params);

          expect(result).toContain('<div class="overflow-auto" style="height: 114px;">');
          expect(result).toContain('Test message content');
          expect(result).toContain('</div>');
        });

        it('should handle empty messages', () => {
          const params = {
            value: ''
          };

          const result = cellRenderer(params);

          expect(result).toContain('<div class="overflow-auto" style="height: 114px;">');
          expect(result).toContain('</div>');
        });

        it('should handle long messages', () => {
          const longMessage = 'A'.repeat(1000);
          const params = {
            value: longMessage
          };

          const result = cellRenderer(params);

          expect(result).toContain('<div class="overflow-auto" style="height: 114px;">');
          expect(result).toContain(longMessage);
          expect(result).toContain('</div>');
        });

        it('should preserve HTML content if present', () => {
          const params = {
            value: 'Message avec <strong>HTML</strong>'
          };

          const result = cellRenderer(params);

          expect(result).toContain('Message avec <strong>HTML</strong>');
        });
      });
    });
  });

  describe('Integration tests', () => {
    it('should create consistent column definitions for different region lists', () => {
      const smallRegionList = ['092', '109'];
      const largeRegionList = Array.from({length: 50}, (_, i) => `${(i + 90).toString().padStart(3, '0')}`);

      const smallColumnDefs = service.getColumnDefs(smallRegionList);
      const largeColumnDefs = service.getColumnDefs(largeRegionList);

      expect(smallColumnDefs.length).toBe(largeColumnDefs.length);

      expect(smallColumnDefs.map(col => (col as ColDef).headerName))
        .toEqual(largeColumnDefs.map(col => (col as ColDef).headerName));
    });

    it('should use same clearFilter instance for all definitions', () => {
      const regions1 = ['092'];
      const regions2 = ['109', '116'];

      const columnDefs1 = service.getColumnDefs(regions1);
      const columnDefs2 = service.getColumnDefs(regions2);

      expect(columnDefs1[0]).toBe(mockColClearFilter);
      expect(columnDefs2[0]).toBe(mockColClearFilter);
    });
  });

  describe('Robustness tests', () => {
    it('should handle regions with special characters', () => {
      const regionsWithSpecialChars = ['092-A', '109_B', '116.C'];

      expect(() => service.getColumnDefs(regionsWithSpecialChars)).not.toThrow();

      const columnDefs = service.getColumnDefs(regionsWithSpecialChars);
      expect(columnDefs).toBeDefined();
      expect(columnDefs.length).toBe(6);
    });

    it('should throw error when cellRenderer receives null/undefined values', () => {
      const columnDefs = service.getColumnDefs(['092']);
      const regionsColDef = columnDefs[1] as ColDef;
      const cellRenderer = regionsColDef.cellRenderer as Function;

      expect(() => cellRenderer({ value: null })).toThrowError();
      expect(() => cellRenderer({ value: undefined })).toThrowError();
      expect(() => cellRenderer({})).toThrowError();
    });

    it('should handle null/undefined messages in message cellRenderer', () => {
      const columnDefs = service.getColumnDefs(['092']);
      const messageColDef = columnDefs[5] as ColDef;
      const cellRenderer = messageColDef.cellRenderer as Function;

      const resultNull = cellRenderer({ value: null });
      const resultUndefined = cellRenderer({ value: undefined });

      expect(resultNull).toContain('<div class="overflow-auto"');
      expect(resultUndefined).toContain('<div class="overflow-auto"');
    });

    it('should handle valid empty array in regions cellRenderer', () => {
      const columnDefs = service.getColumnDefs(['092']);
      const regionsColDef = columnDefs[1] as ColDef;
      const cellRenderer = regionsColDef.cellRenderer as Function;

      expect(() => cellRenderer({ value: [] })).not.toThrow();

      const result = cellRenderer({ value: [] });
      expect(result).toContain('<div class="cell-region">');
    });
  });

  describe('Performance and optimization', () => {
    it('should handle large number of regions efficiently', () => {
      const startTime = performance.now();

      const largeRegionList = Array.from({length: 1000}, (_, i) => `${(i + 1).toString().padStart(3, '0')}`);
      const columnDefs = service.getColumnDefs(largeRegionList);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(50); // Less than 50ms
      expect(columnDefs).toBeDefined();
      expect(columnDefs.length).toBe(6);
    });

    it('should call TableauUtilService.getColClearFilter only once per call', () => {
      mockTableauUtilService.getColClearFilter.calls.reset();

      service.getColumnDefs(['092', '109']);

      expect(mockTableauUtilService.getColClearFilter).toHaveBeenCalledTimes(1);
    });
  });
});
