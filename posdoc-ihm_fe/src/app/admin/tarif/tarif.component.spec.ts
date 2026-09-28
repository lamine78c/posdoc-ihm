import { waitForAsync, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { TarifComponent } from './tarif.component';
import { of, throwError } from 'rxjs';
import { GridApi } from 'ag-grid-community';
import { ApiAdelaideTarifService } from '@app/services/api-adelaide-tarif.service';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { TableauTarifService } from '@app/admin/tarif/service/tableau-tarif.service';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';

describe('TarifComponent', () => {
  let component: TarifComponent;
  let fixture: ComponentFixture<TarifComponent>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;

  const mockApiService = jasmine.createSpyObj('ApiAdelaideTarifService', ['getAllTarpos', 'createTarpos', 'updateTarpos', 'deleteTarpos']);
  const mockTarifService = jasmine.createSpyObj('TableauTarifService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
  const mockNoteService = jasmine.createSpyObj('NotesService', ['show']);
  const mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
  const mockTableauConfigBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
  const mockTableauTarifService = {
    getColumnDefs: jasmine.createSpy('getColumnDefs').and.returnValue([]),
    getDetailColumnDefs: jasmine.createSpy('getDetailColumnDefs').and.returnValue([]),
    getOverlayNoRowsTemplate: jasmine.createSpy('getOverlayNoRowsTemplate').and.returnValue('<span>No data</span>'),
  };

  beforeEach(waitForAsync(() => {
    permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission','hasActionDeMasse']);
    mockTableauConfigBuilderService.createGridConfiguration.and.returnValue({ rowSelection: 'single' });

    TestBed.configureTestingModule({
      declarations: [TarifComponent],
      providers: [
        { provide: ApiAdelaideTarifService, useValue: mockApiService },
        { provide: TableauTarifService, useValue: mockTableauTarifService },
        { provide: NotesService, useValue: mockNoteService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigBuilderService },
        { provide: PermissionService, useValue: permissionServiceSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifComponent);
    component = fixture.componentInstance;
    component.gridApi = {
      setGridOption: jasmine.createSpy('setGridOption'),
      applyTransaction: jasmine.createSpy('applyTransaction'),
      redrawRows: jasmine.createSpy('redrawRows '),
      forEachNode: jasmine.createSpy('forEachNode').and.callFake((callback: (node: any) => void) => {
        [{}, {}, {}].forEach(callback);
      }),
    } as unknown as GridApi;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize gridOptions and columnDefs', () => {
      mockTarifService.getColumnDefs.and.returnValue([]);
      component.ngOnInit();

      expect(component.gridOptions.rowSelection).toBe('single');
      expect(component.columnDefs).toEqual([]);
      expect(component.overlayNoRowsTemplate).toBe('<span>No data</span>');
    });
  });

  describe('getData', () => {
    it('should set rowData on success', () => {
      const mockResponse = {
        data: {
          allTarpos: [{ type: 'T1', tarifs: [{ num: 1 }] }],
        },
      };
      mockApiService.getAllTarpos.and.returnValue(of(mockResponse));
      component.getData();
      expect(component.rowData.length).toBe(ONE);
      expect(component.rowData[ZERO].detail).toEqual([{ num: ONE }]);
    });

    it('should handle empty tarifs', () => {
      const mockResponse = {
        data: {
          allTarpos: [{ type: 'T2', tarifs: null }],
        },
      };
      mockApiService.getAllTarpos.and.returnValue(of(mockResponse));
      component.getData();
      expect(component.rowData[ZERO].detail).toEqual([]);
    });
  });

  describe('onSaveEdition', () => {
    it('should call createTarpos for newRow and show success note', () => {
      const editedRow = new Map<number, any>([[ONE, { newRow: true, type: 'T1' }]]);
      const response = { data: { createTarpos: { type: 'T1' } } };
      mockApiService.createTarpos.and.returnValue(of(response));
      component.gridApi = jasmine.createSpyObj<GridApi>('GridApi', ['forEachNode']);
      component.onSaveEdition(editedRow);
      expect(mockApiService.createTarpos).toHaveBeenCalled();
      expect(mockNoteService.show).toHaveBeenCalled();
    });

    it('should call updateTarpos for existing row', fakeAsync(() => {
      const editedRow = new Map<number, any>([[ONE, { newRow: null, type: 'T1' }]]);
      const response = { data: { updateTarpos: { type: 'T1' } } };
      mockApiService.updateTarpos.and.returnValue(of(response));

      component.onSaveEdition(editedRow);

      tick();

      expect(mockApiService.updateTarpos).toHaveBeenCalled();
    }));
  });

  describe('onDeleteRow', () => {
    it('should call deleteTarpos and remove rows', () => {
      const rowToDelete = [{ type: 'T1' }];
      mockApiService.deleteTarpos.and.returnValue(of({}));
      component.onDeleteRow(rowToDelete);
      expect(mockApiService.deleteTarpos).toHaveBeenCalledWith(['T1']);
      expect(component.gridApi.applyTransaction).toHaveBeenCalled();
      expect(mockNoteService.show).toHaveBeenCalled();
    });

    it('should show plural message when deleting multiple tarifs', () => {
      const rowsToDelete = [{ type: 'T1' }, { type: 'T2' }];
      mockApiService.deleteTarpos.and.returnValue(of({}));
      component.onDeleteRow(rowsToDelete);
      expect(mockNoteService.show).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Les tarifs ont été supprimés avec succès',
        })
      );
    });

    it('should handle delete error', () => {
      const rowToDelete = [{ type: 'T1' }];
      mockApiService.deleteTarpos.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur suppression' }] }));
      component.onDeleteRow(rowToDelete);
      expect(component.asynchronousErrors$.getValue()?.get(1)?.[0].message).toBe('Erreur suppression');
    });
  });

  describe('initGridOptions', () => {
    it('should configure grid with master detail settings', () => {
      component.initGridOptions();
      expect(component.gridOptions.masterDetail).toBe(true);
      expect(component.gridOptions.detailRowAutoHeight).toBe(false);
      expect(component.gridOptions.detailRowHeight).toBe(350);
    });
  });

  describe('onGridReady', () => {
    it('should set grid API, show loading and call getData', () => {
      const params = { api: component.gridApi };
      spyOn(component, 'getData');
      component.onGridReady(params as any);
      expect(component.gridApi.setGridOption).toHaveBeenCalledWith('loading', true);
      expect(component.getData).toHaveBeenCalled();
    });
  });

  describe('prepareTarif', () => {
    it('should clean tarif data', () => {
      const editedRow = new Map([[0, { type: 'T1', collapse: '', detail: [], nullField: null }]]);
      const result = component['prepareTarif'](editedRow);
      expect(result.collapse).toBeUndefined();
      expect(result.detail).toBeUndefined();
      expect(result.nullField).toBeUndefined();
      expect(result.type).toBe('T1');
    });
  });

  describe('handleCreateTarif', () => {
    beforeEach(() => {
      component.gridApi = jasmine.createSpyObj<GridApi>('GridApi', ['forEachNode']);
    });

    it('should create tarif and show success notification', () => {
      const tarif: any = { newRow: true, type: 'T1' };
      const errors = new Map();
      const response = { data: { createTarpos: { type: 'T1' } } };
      mockApiService.createTarpos.and.returnValue(of(response));

      component['handleCreateTarif'](tarif, errors);

      expect(tarif.newRow).toBeUndefined();
      expect(mockApiService.createTarpos).toHaveBeenCalled();
      expect(mockNoteService.show).toHaveBeenCalled();
    });

    it('should handle create error and set newRow back to true', () => {
      const tarif: any = { type: 'T1' };
      const errors = new Map();
      mockApiService.createTarpos.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur' }] }));

      component['handleCreateTarif'](tarif, errors);

      expect(tarif.newRow).toBe(true);
      expect(errors.get(1)?.[0].message).toBe('Erreur');
    });
  });

  describe('handleUpdateTarif', () => {
    it('should update tarif and show success notification', () => {
      const tarif = { type: 'T1' };
      const errors = new Map();
      const response = { data: { updateTarpos: { type: 'T1' } } };
      mockApiService.updateTarpos.and.returnValue(of(response));

      component['handleUpdateTarif'](tarif, errors);

      expect(mockApiService.updateTarpos).toHaveBeenCalled();
      expect(mockNoteService.show).toHaveBeenCalled();
    });

    it('should handle update error', () => {
      const tarif = { type: 'T1' };
      const errors = new Map();
      mockApiService.updateTarpos.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur MAJ' }] }));

      component['handleUpdateTarif'](tarif, errors);

      expect(errors.get(1)?.[0].message).toBe('Erreur MAJ');
    });
  });

  describe('resetNewRows', () => {
    it('should reset newRow properties in grid nodes', () => {
      const nodes: any[] = [
        { data: { newRow: true, type: 'T1' } },
        { data: { type: 'T2' } },
        { data: { newRow: true, type: 'T3' } },
      ];
      component.gridApi = {
        forEachNode: jasmine.createSpy().and.callFake((callback: any) => nodes.forEach(callback)),
      } as any;

      component['resetNewRows']();

      expect(nodes[0].data.collapse).toBe('');
      expect(nodes[0].data.detail).toEqual([]);
      expect(nodes[0].data.newRow).toBeUndefined();
      expect(nodes[2].data.newRow).toBeUndefined();
    });
  });

  describe('buildError', () => {
    it('should build error with graphQLErrors', () => {
      const error = { graphQLErrors: [{ message: 'Test error' }] };
      const result = component['buildError'](error);
      expect(result.message).toBe('Test error');
      expect(result.isError).toBe(true);
    });

    it('should build error with default message when no graphQLErrors', () => {
      const error = {};
      const result = component['buildError'](error);
      expect(result.message).toBe('Erreur inconnue');
    });
  });

  describe('setError', () => {
    it('should add error to new key', () => {
      const errors = new Map();
      const error = { isError: true, message: 'Error', id: null };
      component.setError(1, error, errors);
      expect(errors.get(1)).toEqual([error]);
    });

    it('should append error to existing key', () => {
      const errors = new Map();
      const error1 = { isError: true, message: 'Error1', id: null };
      const error2 = { isError: true, message: 'Error2', id: null };
      component.setError(1, error1, errors);
      component.setError(1, error2, errors);
      expect(errors.get(1).length).toBe(2);
    });
  });

  describe('export', () => {
    beforeEach(() => {
      component.gridApi = {
        getColumnDefs: jasmine.createSpy().and.returnValue([
          { field: 'type', headerName: 'Type' },
          { field: 'libelle', headerName: 'Libellé' },
        ]),
        forEachNodeAfterFilterAndSort: jasmine.createSpy().and.callFake((callback: any) => {
          callback({ data: { type: 'T1', libelle: 'Lib1', detail: [{ numero: 1 }] } });
          callback({ data: { type: 'T2', libelle: 'Lib2', detail: [] } });
        }),
      } as any;
      mockTableauTarifService.getDetailColumnDefs.and.returnValue([{ field: 'numero', headerName: 'Numéro' }]);
    });

    it('should export as PDF', () => {
      const event = { type: 'exportAsPDF' };
      component.export(event);
      expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalled();
    });

    it('should export as Excel', () => {
      const event = { type: 'exportAsExcel' };
      component.export(event);
      expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalled();
    });

    it('should log warning for unsupported export type', () => {
      spyOn(console, 'warn');
      const event = { type: 'exportAsCSV' };
      component.export(event);
      expect(console.warn).toHaveBeenCalledWith('Unsupported export type: exportAsCSV');
    });
  });

  describe('prepareMetadata', () => {
    it('should prepare headers and fields', () => {
      component.gridApi = {
        getColumnDefs: jasmine.createSpy().and.returnValue([
          { field: 'type', headerName: 'Type' },
          { field: null, headerName: 'Invalid' },
        ]),
      } as any;
      mockTableauTarifService.getDetailColumnDefs.and.returnValue([{ field: 'numero', headerName: 'Numéro' }]);

      const result = component['prepareMetadata']();

      expect(result.headers).toEqual(['Type']);
      expect(result.fields).toEqual(['type']);
    });
  });

  describe('buildExportData', () => {
    it('should build export data with details', () => {
      component.gridApi = {
        forEachNodeAfterFilterAndSort: jasmine.createSpy().and.callFake((callback: any) => {
          callback({ data: { type: 'T1', detail: [{ num: 1 }, { num: 2 }] } });
        }),
      } as any;

      const result = component['buildExportData'](['type'], ['num'], [null], [null]);

      expect(result.totalRows).toBe(1);
      expect(result.dataExcel.length).toBe(2);
    });

    it('should build export data without details', () => {
      component.gridApi = {
        forEachNodeAfterFilterAndSort: jasmine.createSpy().and.callFake((callback: any) => {
          callback({ data: { type: 'T1', detail: [] } });
        }),
      } as any;

      const result = component['buildExportData'](['type'], ['num'], [null], [null]);

      expect(result.totalRows).toBe(1);
      expect(result.dataExcel.length).toBe(1);
    });
  });
});
