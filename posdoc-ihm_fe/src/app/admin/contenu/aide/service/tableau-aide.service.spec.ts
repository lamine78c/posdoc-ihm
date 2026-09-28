import { TestBed } from '@angular/core/testing';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { TableauAideService } from './tableau-aide.service';
import { AUTH } from '@app/services/permission/PermissionsFile';

describe('TableauAideService', () => {
  let service: TableauAideService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  let mockActionColumns: ColDef[];

  beforeEach(() => {
    mockActionColumns = [{ headerName: 'Actions', field: 'actions', width: 100 }];

    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);
    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionColumns);

    TestBed.configureTestingModule({
      providers: [
        TableauAideService,
        { provide: TableauUtilService, useValue: mockTableauUtilService }
      ],
    });

    service = TestBed.inject(TableauAideService);
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
    it('should call getColsDefAction with correct parameters when isColSelectAll is true', () => {
      service.getColumnDefs(true);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.CONTENU.AIDE,
        { isColSelectAll: true, isNoColEdit: false, isNoColDelete: false, isColEditPopup: true, sortable: false },
        {
          delete: {
            cellRendererParams: {
              messages: jasmine.any(Array),
              idsLabel: ['pathLabel'],
            },
          },
        }
      );
    });

    it('should call getColsDefAction with correct parameters when isColSelectAll is false', () => {
      service.getColumnDefs(false);

      expect(mockTableauUtilService.getColsDefAction).toHaveBeenCalledWith(
        AUTH.ADMINISTRATION.CONTENU.AIDE,
        { isColSelectAll: false, isNoColEdit: false, isNoColDelete: false, isColEditPopup: true, sortable: false },
        {
          delete: {
            cellRendererParams: {
              messages: jasmine.any(Array),
              idsLabel: ['pathLabel'],
            },
          },
        }
      );
    });

    it('should return action columns concatenated with data columns', () => {
      const columnDefs = service.getColumnDefs(false);

      expect(columnDefs).toBeDefined();
      expect(columnDefs.length).toBe(6); // 1 mock action + 5 data columns
      expect(columnDefs[0]).toBe(mockActionColumns[0]);
    });

    it('should include all required data columns', () => {
      const columnDefs = service.getColumnDefs(false);
      const headers = columnDefs.map(col => (col as ColDef).headerName);

      expect(headers).toContain('Page');
      expect(headers).toContain('Message');
      expect(headers).toContain('Etat');
      expect(headers).toContain('Modifié par');
      expect(headers).toContain('Date modification');
    });
  });

  describe('Column configurations', () => {
    let columnDefs: (ColDef | ColGroupDef)[];

    beforeEach(() => {
      columnDefs = service.getColumnDefs(false);
    });

    describe('Page Column', () => {
      let pageColDef: ColDef;

      beforeEach(() => {
        pageColDef = columnDefs[2] as ColDef;
      });

      it('should have correct configuration', () => {
        expect(pageColDef.headerName).toBe('Page');
        expect(pageColDef.field).toBe('pathLabel');
        expect(pageColDef.flex).toBe(1);
        expect(pageColDef.minWidth).toBe(420);
        expect(pageColDef.sortable).toBe(false);
        expect(pageColDef.sort).toBe('asc');
        expect(pageColDef.sortIndex).toBe(0);
        expect(pageColDef.filter).toBe('agTextColumnFilter');
        expect(pageColDef.floatingFilter).toBe(true);
        expect(pageColDef.floatingFilterComponent).toBe('inputFilter');
      });
    });

    describe('Message Column', () => {
      let messageColDef: ColDef;

      beforeEach(() => {
        messageColDef = columnDefs[3] as ColDef;
      });

      it('should have correct configuration', () => {
        expect(messageColDef.headerName).toBe('Message');
        expect(messageColDef.field).toBe('message');
        expect(messageColDef.sortable).toBe(false);
        expect(messageColDef.filter).toBe('agTextColumnFilter');
        expect(messageColDef.floatingFilter).toBe(true);
        expect(messageColDef.floatingFilterComponent).toBe('inputFilter');
        expect(messageColDef.wrapText).toBe(false);
        expect(messageColDef.autoHeight).toBe(false);
        expect(messageColDef.flex).toBe(1);
        expect(messageColDef.cellRenderer).toBeDefined();
        expect(messageColDef.cellStyle).toEqual({
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        });
      });
    });

    describe('Etat Column', () => {
      let etatColDef: ColDef;

      beforeEach(() => {
        etatColDef = columnDefs[1] as ColDef;
      });

      it('should have correct configuration', () => {
        expect(etatColDef.headerName).toBe('Etat');
        expect(etatColDef.field).toBe('status');
        expect(etatColDef.sortable).toBe(false);
        expect(etatColDef.filter).toBe('agTextColumnFilter');
        expect(etatColDef.floatingFilter).toBe(true);
        expect(etatColDef.floatingFilterComponent).toBe('listFloatingFilter');
        expect(etatColDef.cellRenderer).toBeDefined();
        expect(etatColDef.cellRendererParams).toBeDefined();
      });

      it('should have correct floating filter parameters', () => {
        const filterParams = etatColDef.floatingFilterComponentParams;

        expect(filterParams.possibleLabelWithValues).toEqual([
          { label: 'Brouillon', value: 'draft' },
          { label: 'Activé', value: 'enabled' },
          { label: 'Désactivé', value: 'disabled' },
        ]);
        expect(filterParams.suppressFilterButton).toBe(true);
      });

      it('should have correct cellRendererParams', () => {
        const cellRendererParams = etatColDef.cellRendererParams;

        expect(cellRendererParams.isAllTimeClickable).toBe(true);
        expect(cellRendererParams.formKey).toBe('status');
        expect(cellRendererParams.values).toEqual([
          { text: 'Activé', value: 'enabled' },
          { text: 'Désactivé', value: 'disabled' },
        ]);
      });
    });

    describe('Modifié par Column', () => {
      let modifiedByColDef: ColDef;

      beforeEach(() => {
        modifiedByColDef = columnDefs[4] as ColDef;
      });

      it('should have correct configuration', () => {
        expect(modifiedByColDef.headerName).toBe('Modifié par');
        expect(modifiedByColDef.field).toBe('updated_by');
        expect(modifiedByColDef.sortable).toBe(false);
        expect(modifiedByColDef.flex).toBe(1);
        expect(modifiedByColDef.minWidth).toBe(150);
        expect(modifiedByColDef.filter).toBe('agTextColumnFilter');
        expect(modifiedByColDef.floatingFilterComponent).toBe('inputFilter');
        expect(modifiedByColDef.floatingFilter).toBe(true);
      });
    });

    describe('Date modification Column', () => {
      let dateModificationColDef: ColDef;

      beforeEach(() => {
        dateModificationColDef = columnDefs[5] as ColDef;
      });

      it('should have correct configuration', () => {
        expect(dateModificationColDef.headerName).toBe('Date modification');
        expect(dateModificationColDef.field).toBe('updated_at');
        expect(dateModificationColDef.sortable).toBe(false);
        expect(dateModificationColDef.sort).toBe('desc');
        expect(dateModificationColDef.sortIndex).toBe(1);
        expect(dateModificationColDef.flex).toBe(1);
        expect(dateModificationColDef.minWidth).toBe(150);
        expect(dateModificationColDef.filter).toBe('agDateColumnFilter');
        expect(dateModificationColDef.floatingFilterComponent).toBe('agDateInput');
        expect(dateModificationColDef.floatingFilter).toBe(true);
        expect(dateModificationColDef.filterParams).toBeDefined();
      });

      describe('valueFormatter for date modification', () => {
        let valueFormatter: Function;

        beforeEach(() => {
          valueFormatter = dateModificationColDef.valueFormatter as Function;
        });

        it('should format valid date to French locale', () => {
          const params = {
            value: new Date('2024-03-20T14:45:00'),
          };

          const result = valueFormatter(params);

          expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        });

        it('should return empty string for null value', () => {
          const params = {
            value: null,
          };

          const result = valueFormatter(params);

          expect(result).toBe('');
        });

        it('should return empty string for undefined value', () => {
          const params = {
            value: undefined,
          };

          const result = valueFormatter(params);

          expect(result).toBe('');
        });
      });
    });
  });

  describe('Integration tests', () => {
    it('should create consistent column definitions for different isColSelectAll values', () => {
      const columnDefsTrue = service.getColumnDefs(true);
      const columnDefsFalse = service.getColumnDefs(false);

      expect(columnDefsTrue.length).toBe(columnDefsFalse.length);

      expect(columnDefsTrue.map(col => (col as ColDef).headerName)).toEqual(columnDefsFalse.map(col => (col as ColDef).headerName));
    });
  });
});
