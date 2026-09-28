import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReeditionsComponent } from './reeditions.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauReeditionService } from './service/tableau-reedition.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ApiAdelaideReeditionService } from '@app/services/api-adelaide-reedition.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridOptions, GridReadyEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { AddType } from '@app/models/enums/add-type';

describe('ReeditionsComponent', () => {
  let component: ReeditionsComponent;
  let fixture: ComponentFixture<ReeditionsComponent>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauReeditionService: jasmine.SpyObj<TableauReeditionService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideReeditionService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  const mockReeditionsData = {
    data: {
      allParametresEdition: [
        { reference: 'REF001', type: 'A4', libelle: 'Edition 1', lineNumber: 1, columnNumber: 10, length: 20 },
        { reference: 'REF002', type: 'A5', libelle: 'Edition 2', lineNumber: 2, columnNumber: 15, length: 25 },
        { reference: 'REF003', type: 'LETTER', libelle: 'Edition 3', lineNumber: 3, columnNumber: 20, length: 30 },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  const mockFormatsData = {
    data: {
      allFormats: [
        { code: 'A4' },
        { code: 'A5' },
        { code: 'LETTER' },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauReeditionService = jasmine.createSpyObj('TableauReeditionService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideReeditionService', [
      'getAllParametresEdition',
      'getAllSelectConfig',
      'createParametreEdition',
      'updateParametreEdition',
      'deleteParametresEdition',
    ]);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission', 'hasActionDeMasse']);

    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({} as GridOptions);
    mockTableauReeditionService.getColumnDefs.and.returnValue([{ field: 'type', cellRendererParams: {} }] as any);
    mockTableauReeditionService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');
    mockApiAdelaideService.getAllParametresEdition.and.returnValue(of(mockReeditionsData) as any);
    mockApiAdelaideService.getAllSelectConfig.and.returnValue(of(mockFormatsData) as any);
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [ReeditionsComponent],
      providers: [
        { provide: NotesService, useValue: mockNotesService },
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauReeditionService, useValue: mockTableauReeditionService },
        { provide: ApiAdelaideReeditionService, useValue: mockApiAdelaideService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    if (mockNotesService?.show) {
      mockNotesService.show.calls.reset();
    }
    if (mockApiAdelaideService?.getAllParametresEdition) {
      mockApiAdelaideService.getAllParametresEdition.calls.reset();
    }
    if (mockApiAdelaideService?.createParametreEdition) {
      mockApiAdelaideService.createParametreEdition.calls.reset();
    }
    if (mockApiAdelaideService?.updateParametreEdition) {
      mockApiAdelaideService.updateParametreEdition.calls.reset();
    }
    if (mockApiAdelaideService?.deleteParametresEdition) {
      mockApiAdelaideService.deleteParametresEdition.calls.reset();
    }

    fixture = TestBed.createComponent(ReeditionsComponent);
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
    expect(component.typeFormatData$).toBeDefined();
  });

  it('should initialize gridOptions and columnDefs on ngOnInit', () => {
    component.ngOnInit();

    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalled();
    expect(mockTableauReeditionService.getColumnDefs).toHaveBeenCalled();
    expect(mockTableauReeditionService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBeDefined();
  });

  it('should load reeditions and formats data on grid ready', (done) => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = { api: mockGridApi } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    setTimeout(() => {
      expect(mockApiAdelaideService.getAllParametresEdition).toHaveBeenCalled();
      expect(mockApiAdelaideService.getAllSelectConfig).toHaveBeenCalled();
      expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
      expect(component.gridApi).toBe(mockGridApi);
      done();
    }, 100);
  });

  it('should set rowData and nombreTotal after loading reeditions', (done) => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = { api: mockGridApi } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    setTimeout(() => {
      expect(component.rowData).toEqual(mockReeditionsData.data.allParametresEdition);
      expect(component.nombreTotal).toBe(3);
      expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
      done();
    }, 100);
  });

  it('should populate typeFormatData$ with sorted formats', (done) => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = { api: mockGridApi } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    setTimeout(() => {
      component.typeFormatData$.subscribe(data => {
        expect(data.length).toBe(3);
        expect(data[0]).toEqual({ value: 'A4', text: 'A4' });
        expect(data[1]).toEqual({ value: 'A5', text: 'A5' });
        expect(data[2]).toEqual({ value: 'LETTER', text: 'LETTER' });
      });
      done();
    }, 100);
  });

  it('should create new reedition successfully on save edition', (done) => {
    const newReedition = {
      reference: 'REF004',
      type: 'A4',
      libelle: 'Edition 4',
      lineNumber: 4,
      columnNumber: 25,
      length: 35,
      newRow: true,
    };
    const editedRow = new Map([[0, newReedition]]);
    const mockResponse = { data: { createParametreEdition: { reference: 'REF004' } } };

    mockApiAdelaideService.createParametreEdition.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['forEachNode']);
    component.gridApi = mockGridApi;
    mockGridApi.forEachNode.and.callFake((_callback) => {});

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createParametreEdition).toHaveBeenCalled();
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: "Le paramètre d'édition \"REF004\" a été créé avec succès",
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when creating reedition fails', (done) => {
    const newReedition = { reference: 'ERR', type: 'A4', libelle: 'Error', lineNumber: 1, columnNumber: 1, length: 1, newRow: true };
    const editedRow = new Map([[0, newReedition]]);
    const mockError = { graphQLErrors: [{ message: 'Error creating reedition' }] };

    mockApiAdelaideService.createParametreEdition.and.returnValue(throwError(mockError));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createParametreEdition).toHaveBeenCalled();
      expect(mockNotesService.show).not.toHaveBeenCalled();
      expect(newReedition.newRow).toBe(true);
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
        }
      });
      done();
    }, 100);
  });

  it('should update existing reedition successfully on save edition', (done) => {
    const existingReedition = { reference: 'REF001', type: 'A4', libelle: 'Updated', lineNumber: 5, columnNumber: 30, length: 40 };
    const editedRow = new Map([[0, existingReedition]]);
    const mockResponse = { data: { updateParametreEdition: { reference: 'REF001' } } };

    mockApiAdelaideService.updateParametreEdition.and.returnValue(of(mockResponse));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.updateParametreEdition).toHaveBeenCalled();
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: "Le paramètre d'édition \"REF001\" a été mis à jour avec succès",
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when updating reedition fails', (done) => {
    const existingReedition = { reference: 'REF001', type: 'A4', libelle: 'Updated' };
    const editedRow = new Map([[0, existingReedition]]);
    const mockError = { graphQLErrors: [{ message: 'Error updating reedition' }] };

    mockApiAdelaideService.updateParametreEdition.and.returnValue(throwError(mockError));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.updateParametreEdition).toHaveBeenCalled();
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
        }
      });
      done();
    }, 100);
  });

  it('should delete single reedition successfully', (done) => {
    const reeditionsToDelete = [{ reference: 'REF001' }];
    const mockResponse = { data: { deleteParametresEdition: true } };

    mockApiAdelaideService.deleteParametresEdition.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((_callback) => {
      _callback({ data: { reference: 'REF002' } });
      _callback({ data: { reference: 'REF003' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(reeditionsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteParametresEdition).toHaveBeenCalledWith(['REF001']);
      expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: reeditionsToDelete });
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Le paramètre a été supprimé avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should delete multiple reeditions successfully', (done) => {
    const reeditionsToDelete = [{ reference: 'REF001' }, { reference: 'REF002' }];
    const mockResponse = { data: { deleteParametresEdition: true } };

    mockApiAdelaideService.deleteParametresEdition.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((_callback) => {
      _callback({ data: { reference: 'REF003' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(reeditionsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteParametresEdition).toHaveBeenCalledWith(['REF001', 'REF002']);
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Les paramètres  ont été supprimés avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when deleting reedition fails', (done) => {
    const reeditionsToDelete = [{ reference: 'REF001' }];
    const mockError = { graphQLErrors: [{ message: 'Error deleting reedition' }] };

    mockApiAdelaideService.deleteParametresEdition.and.returnValue(throwError(mockError));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows']);
    component.gridApi = mockGridApi;

    component.onDeleteRow(reeditionsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteParametresEdition).toHaveBeenCalled();
      expect(mockGridApi.applyTransaction).not.toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should set error correctly in errors map', () => {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const error1: TableAsynchronousError = { isError: true, message: 'Error 1', id: null };
    const error2: TableAsynchronousError = { isError: true, message: 'Error 2', id: null };

    component.setError(1, error1, errors);
    expect(errors.get(1).length).toBe(1);

    component.setError(1, error2, errors);
    expect(errors.get(1).length).toBe(2);
  });

  it('should export data as PDF', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);
    const mockColumnDefs = [
      { field: 'reference', headerName: 'Référence clé' },
      { field: 'type', headerName: 'Type format' },
    ];
    const mockData = [
      { reference: 'REF001', type: 'A4' },
      { reference: 'REF002', type: 'A5' },
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach(data => callback({ data }));
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsPDF' });

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [['REF001', 'A4'], ['REF002', 'A5']],
      ['Référence clé', 'Type format'],
      'Liste des reeditions'
    );
  });

  it('should export data as Excel', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);
    const mockColumnDefs = [{ field: 'reference', headerName: 'Référence clé' }];
    const mockData = [{ reference: 'REF001' }];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach(data => callback({ data }));
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsExcel' });

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(
      [['REF001']],
      ['Référence clé'],
      'Liste des reeditions'
    );
  });

  it('should have correct permission properties', () => {
    expect(component.canAddPermPosition).toBeDefined();
    expect(component.canRemovePermPosition).toBeDefined();
  });
});

