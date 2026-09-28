import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SupportsComponent } from './supports.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauSupportService } from './service/tableau-support.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ApiAdelaideSupportService } from '@app/services/api-adelaide-support.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridOptions, GridReadyEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { AddType } from '@app/models/enums/add-type';

describe('SupportsComponent', () => {
  let component: SupportsComponent;
  let fixture: ComponentFixture<SupportsComponent>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauSupportService: jasmine.SpyObj<TableauSupportService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideSupportService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  const mockSupportsData = {
    data: {
      allSupports: [
        { type: 'PAPIER', libelle: 'Papier standard', poids: 80 },
        { type: 'CARTON', libelle: 'Carton épais', poids: 250 },
        { type: 'PLASTIQUE', libelle: 'Plastique souple', poids: 120 },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauSupportService = jasmine.createSpyObj('TableauSupportService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideSupportService', [
      'getAllSupports',
      'createSupport',
      'updateSupport',
      'deleteSupports',
    ]);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission', 'hasActionDeMasse']);

    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({} as GridOptions);
    mockTableauSupportService.getColumnDefs.and.returnValue([]);
    mockTableauSupportService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');
    mockApiAdelaideService.getAllSupports.and.returnValue(of(mockSupportsData) as any);
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [SupportsComponent],
      providers: [
        { provide: NotesService, useValue: mockNotesService },
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauSupportService, useValue: mockTableauSupportService },
        { provide: ApiAdelaideSupportService, useValue: mockApiAdelaideService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    if (mockNotesService?.show) {
      mockNotesService.show.calls.reset();
    }
    if (mockApiAdelaideService?.getAllSupports) {
      mockApiAdelaideService.getAllSupports.calls.reset();
    }
    if (mockApiAdelaideService?.createSupport) {
      mockApiAdelaideService.createSupport.calls.reset();
    }
    if (mockApiAdelaideService?.updateSupport) {
      mockApiAdelaideService.updateSupport.calls.reset();
    }
    if (mockApiAdelaideService?.deleteSupports) {
      mockApiAdelaideService.deleteSupports.calls.reset();
    }

    fixture = TestBed.createComponent(SupportsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component with correct properties', () => {
    expect(component.rowData).toEqual([]);
    expect(component.addType).toBe(AddType.INLINE_ROW);
    expect(component.asynchronousErrors$).toBeDefined();
  });

  it('should initialize gridOptions and columnDefs on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalled();
    expect(mockTableauSupportService.getColumnDefs).toHaveBeenCalled();
    expect(mockTableauSupportService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBeDefined();
  });

  it('should load supports data on grid ready', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = { api: mockGridApi } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    expect(mockApiAdelaideService.getAllSupports).toHaveBeenCalled();
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(component.gridApi).toBe(mockGridApi);
    expect(component.gridColumnApi).toBe(mockGridApi);
  });

  it('should set rowData and nombreTotal after loading supports', (done) => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = { api: mockGridApi } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    setTimeout(() => {
      expect(component.rowData).toEqual(mockSupportsData.data.allSupports);
      expect(component.nombreTotal).toBe(3);
      expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
      done();
    }, 100);
  });

  it('should create new support successfully on save edition', (done) => {
    const newSupport = { type: 'VINYL', libelle: 'Vinyl adhésif', poids: 150, newRow: true };
    const editedRow = new Map([[0, newSupport]]);
    const mockResponse = { data: { createSupport: { type: 'VINYL' } } };

    mockApiAdelaideService.createSupport.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['forEachNode']);
    component.gridApi = mockGridApi;
    mockGridApi.forEachNode.and.callFake((_callback) => {});

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createSupport).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'VINYL', libelle: 'Vinyl adhésif', poids: 150 })
      );
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le support "VINYL" a été créé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when creating support fails', (done) => {
    const newSupport = { type: 'ERR', libelle: 'Error support', poids: 100, newRow: true };
    const editedRow = new Map([[0, newSupport]]);
    const mockError = { graphQLErrors: [{ message: 'Error creating support' }] };

    mockApiAdelaideService.createSupport.and.returnValue(throwError(mockError));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createSupport).toHaveBeenCalled();
      expect(mockNotesService.show).not.toHaveBeenCalled();
      expect(newSupport.newRow).toBe(true);
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
          const errorList = errors.get(1);
          expect(errorList[0].message).toBe('Error creating support');
        }
      });
      done();
    }, 100);
  });

  it('should update existing support successfully on save edition', (done) => {
    const existingSupport = { type: 'PAPIER', libelle: 'Updated Papier', poids: 90 };
    const editedRow = new Map([[0, existingSupport]]);
    const mockResponse = { data: { updateSupport: { type: 'PAPIER' } } };

    mockApiAdelaideService.updateSupport.and.returnValue(of(mockResponse));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.updateSupport).toHaveBeenCalledWith(
        jasmine.objectContaining(existingSupport)
      );
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le support "PAPIER" a été mis à jour avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when updating support fails', (done) => {
    const existingSupport = { type: 'PAPIER', libelle: 'Updated Papier', poids: 90 };
    const editedRow = new Map([[0, existingSupport]]);
    const mockError = { graphQLErrors: [{ message: 'Error updating support' }] };

    mockApiAdelaideService.updateSupport.and.returnValue(throwError(mockError));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.updateSupport).toHaveBeenCalled();
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
          const errorList = errors.get(1);
          expect(errorList[0].message).toBe('Error updating support');
        }
      });
      done();
    }, 100);
  });

  it('should delete single support successfully', (done) => {
    const supportsToDelete = [{ type: 'PAPIER', libelle: 'Papier standard', poids: 80 }];
    const mockResponse = { data: { deleteSupports: true } };

    mockApiAdelaideService.deleteSupports.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((_callback) => {
      _callback({ data: { type: 'CARTON' } });
      _callback({ data: { type: 'PLASTIQUE' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(supportsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteSupports).toHaveBeenCalledWith(['PAPIER']);
      expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: supportsToDelete });
      expect(mockGridApi.redrawRows).toHaveBeenCalled();
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le support a été supprimé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should delete multiple supports successfully', (done) => {
    const supportsToDelete = [
      { type: 'PAPIER', libelle: 'Papier standard', poids: 80 },
      { type: 'CARTON', libelle: 'Carton épais', poids: 250 },
    ];
    const mockResponse = { data: { deleteSupports: true } };

    mockApiAdelaideService.deleteSupports.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((_callback) => {
      _callback({ data: { type: 'PLASTIQUE' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(supportsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteSupports).toHaveBeenCalledWith(['PAPIER', 'CARTON']);
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Les supports  ont été supprimés avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when deleting support fails', (done) => {
    const supportsToDelete = [{ type: 'PAPIER', libelle: 'Papier standard', poids: 80 }];
    const mockError = { graphQLErrors: [{ message: 'Error deleting support' }] };

    mockApiAdelaideService.deleteSupports.and.returnValue(throwError(mockError));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows']);
    component.gridApi = mockGridApi;

    component.onDeleteRow(supportsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteSupports).toHaveBeenCalled();
      expect(mockGridApi.applyTransaction).not.toHaveBeenCalled();
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
        }
      });
      done();
    }, 100);
  });

  it('should set error correctly in errors map', () => {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const error1: TableAsynchronousError = { isError: true, message: 'Error 1', id: null };
    const error2: TableAsynchronousError = { isError: true, message: 'Error 2', id: null };

    component.setError(1, error1, errors);
    expect(errors.get(1).length).toBe(1);
    expect(errors.get(1)[0].message).toBe('Error 1');

    component.setError(1, error2, errors);
    expect(errors.get(1).length).toBe(2);
    expect(errors.get(1)[1].message).toBe('Error 2');
  });

  it('should export data as PDF', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);
    const mockColumnDefs = [
      { field: 'type', headerName: 'Support' },
      { field: 'libelle', headerName: 'Libellé' },
      { field: 'poids', headerName: 'Poids' },
    ];
    const mockData = [
      { type: 'PAPIER', libelle: 'Papier standard', poids: 80 },
      { type: 'CARTON', libelle: 'Carton épais', poids: 250 },
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach(data => callback({ data }));
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsPDF' });

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [['PAPIER', 'Papier standard', 80], ['CARTON', 'Carton épais', 250]],
      ['Support', 'Libellé', 'Poids'],
      'Liste des supports'
    );
  });

  it('should export data as Excel', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);
    const mockColumnDefs = [
      { field: 'type', headerName: 'Support' },
      { field: 'libelle', headerName: 'Libellé' },
    ];
    const mockData = [
      { type: 'PAPIER', libelle: 'Papier standard' },
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach(data => callback({ data }));
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsExcel' });

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(
      [['PAPIER', 'Papier standard']],
      ['Support', 'Libellé'],
      'Liste des supports'
    );
  });

  it('should have correct permission properties', () => {
    expect(component.canAddPermPosition).toBeDefined();
    expect(component.canRemovePermPosition).toBeDefined();
  });
});

