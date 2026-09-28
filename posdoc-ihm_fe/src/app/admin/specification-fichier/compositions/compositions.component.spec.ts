import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CompositionsComponent } from './compositions.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauCompositionService } from './service/tableau-composition.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ApiAdelaideCompositionService } from '@app/services/api-adelaide-composition.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { AddType } from '@app/models/enums/add-type';

describe('CompositionsComponent', () => {
  let component: CompositionsComponent;
  let fixture: ComponentFixture<CompositionsComponent>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauCompositionService: jasmine.SpyObj<TableauCompositionService>;
  let mockApiAdelaideService: jasmine.SpyObj<ApiAdelaideCompositionService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  const mockCompositionsData = {
    data: {
      allCompositions: [
        { code: '-', libelle: 'Pas de composition' },
        { code: 'D', libelle: 'Conversion Docbridge' },
        { code: 'X', libelle: 'XML Transformation' },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauCompositionService = jasmine.createSpyObj('TableauCompositionService', [
      'getColumnDefs',
      'getOverlayNoRowsTemplate',
    ]);
    mockApiAdelaideService = jasmine.createSpyObj('ApiAdelaideCompositionService', [
      'getAllCompositions',
      'createComposition',
      'updateComposition',
      'deleteCompositions',
    ]);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission', 'hasActionDeMasse']);

    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({} as GridOptions);
    mockTableauCompositionService.getColumnDefs.and.returnValue([]);
    mockTableauCompositionService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucun résultat</span>');
    mockApiAdelaideService.getAllCompositions.and.returnValue(of(mockCompositionsData));
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [CompositionsComponent],
      providers: [
        { provide: NotesService, useValue: mockNotesService },
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauCompositionService, useValue: mockTableauCompositionService },
        { provide: ApiAdelaideCompositionService, useValue: mockApiAdelaideService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Reset all mocks before each test
    if (mockNotesService?.show) {
      mockNotesService.show.calls.reset();
    }
    if (mockApiAdelaideService?.getAllCompositions) {
      mockApiAdelaideService.getAllCompositions.calls.reset();
    }
    if (mockApiAdelaideService?.createComposition) {
      mockApiAdelaideService.createComposition.calls.reset();
    }
    if (mockApiAdelaideService?.updateComposition) {
      mockApiAdelaideService.updateComposition.calls.reset();
    }
    if (mockApiAdelaideService?.deleteCompositions) {
      mockApiAdelaideService.deleteCompositions.calls.reset();
    }

    fixture = TestBed.createComponent(CompositionsComponent);
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
    expect(mockTableauCompositionService.getColumnDefs).toHaveBeenCalled();
    expect(mockTableauCompositionService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBeDefined();
  });

  it('should load compositions data on grid ready', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = {
      api: mockGridApi,
    } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    expect(mockApiAdelaideService.getAllCompositions).toHaveBeenCalled();
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(component.gridApi).toBe(mockGridApi);
    expect(component.gridColumnApi).toBe(mockGridApi);
  });

  it('should set rowData and nombreTotal after loading compositions', (done) => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    const mockParams: GridReadyEvent = {
      api: mockGridApi,
    } as any;

    component.ngOnInit();
    component.onGridReady(mockParams);

    setTimeout(() => {
      expect(component.rowData).toEqual(mockCompositionsData.data.allCompositions);
      expect(component.nombreTotal).toBe(3);
      expect(mockGridApi.setGridOption).toHaveBeenCalledWith('loading', false);
      done();
    }, 100);
  });

  it('should create new composition successfully on save edition', (done) => {
    const newComposition = { code: 'N', libelle: 'Nouvelle composition', newRow: true };
    const editedRow = new Map([[0, newComposition]]);
    const mockResponse = { data: { createComposition: { code: 'N' } } };

    mockApiAdelaideService.createComposition.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['forEachNode', 'onSortChanged']);
    component.gridApi = mockGridApi;
    mockGridApi.forEachNode.and.callFake((callback) => {
      // Simulate no nodes with newRow property
    });

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createComposition).toHaveBeenCalledWith(jasmine.objectContaining({ code: 'N', libelle: 'Nouvelle composition' }));
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'La Composition "N" a été créée avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      expect(mockGridApi.onSortChanged).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should handle error when creating composition fails', (done) => {
    const newComposition = { code: 'E', libelle: 'Error composition', newRow: true };
    const editedRow = new Map([[0, newComposition]]);
    const mockError = { graphQLErrors: [{ message: 'Error creating composition' }] };

    mockApiAdelaideService.createComposition.and.returnValue(throwError(mockError));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.createComposition).toHaveBeenCalled();
      expect(mockNotesService.show).not.toHaveBeenCalled();
      expect(newComposition.newRow).toBe(true);
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
          const errorList = errors.get(1);
          expect(errorList[0].message).toBe('Error creating composition');
        }
      });
      done();
    }, 100);
  });

  it('should update existing composition successfully on save edition', (done) => {
    const existingComposition = { code: 'D', libelle: 'Updated Docbridge' };
    const editedRow = new Map([[0, existingComposition]]);
    const mockResponse = { data: { updateComposition: { code: 'D' } } };

    mockApiAdelaideService.updateComposition.and.returnValue(of(mockResponse));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.updateComposition).toHaveBeenCalledWith(jasmine.objectContaining(existingComposition));
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'La Composition "D" a été mise à jour avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when updating composition fails', (done) => {
    const existingComposition = { code: 'D', libelle: 'Updated Docbridge' };
    const editedRow = new Map([[0, existingComposition]]);
    const mockError = { graphQLErrors: [{ message: 'Error updating composition' }] };

    mockApiAdelaideService.updateComposition.and.returnValue(throwError(mockError));

    component.onSaveEdition(editedRow);

    setTimeout(() => {
      expect(mockApiAdelaideService.updateComposition).toHaveBeenCalled();
      component.asynchronousErrors$.subscribe(errors => {
        if (errors) {
          expect(errors.size).toBe(1);
          const errorList = errors.get(1);
          expect(errorList[0].message).toBe('Error updating composition');
        }
      });
      done();
    }, 100);
  });

  it('should delete single composition successfully', (done) => {
    const compositionsToDelete = [{ code: 'D', libelle: 'Conversion Docbridge' }];
    const mockResponse = { data: { deleteCompositions: true } };

    mockApiAdelaideService.deleteCompositions.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((callback) => {
      // Simulate 2 remaining rows after deletion
      callback({ data: { code: '-', libelle: 'Pas de composition' } });
      callback({ data: { code: 'X', libelle: 'XML Transformation' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(compositionsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteCompositions).toHaveBeenCalledWith(['D']);
      expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ remove: compositionsToDelete });
      expect(mockGridApi.redrawRows).toHaveBeenCalled();
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'La composition a été supprimée avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should delete multiple compositions successfully', (done) => {
    const compositionsToDelete = [
      { code: 'D', libelle: 'Conversion Docbridge' },
      { code: 'X', libelle: 'XML Transformation' },
    ];
    const mockResponse = { data: { deleteCompositions: true } };

    mockApiAdelaideService.deleteCompositions.and.returnValue(of(mockResponse));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows', 'forEachNode']);
    mockGridApi.forEachNode.and.callFake((callback) => {
      // Simulate 1 remaining row after deletion
      callback({ data: { code: '-', libelle: 'Pas de composition' } });
    });
    component.gridApi = mockGridApi;

    component.onDeleteRow(compositionsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteCompositions).toHaveBeenCalledWith(['D', 'X']);
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'Les compositions ont été supprimées avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS,
      });
      done();
    }, 100);
  });

  it('should handle error when deleting composition fails', (done) => {
    const compositionsToDelete = [{ code: 'D', libelle: 'Conversion Docbridge' }];
    const mockError = { graphQLErrors: [{ message: 'Error deleting composition' }] };

    mockApiAdelaideService.deleteCompositions.and.returnValue(throwError(mockError));

    const mockGridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows']);
    component.gridApi = mockGridApi;

    component.onDeleteRow(compositionsToDelete);

    setTimeout(() => {
      expect(mockApiAdelaideService.deleteCompositions).toHaveBeenCalled();
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
      { field: 'code', headerName: 'Composition' },
      { field: 'libelle', headerName: 'Libellé' },
    ];
    const mockData = [
      { code: 'D', libelle: 'Conversion Docbridge' },
      { code: 'X', libelle: 'XML Transformation' },
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach(data => callback({ data }));
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsPDF' });

    expect(mockGenerateFileService.generatePDFFile).toHaveBeenCalledWith(
      [['D', 'Conversion Docbridge'], ['X', 'XML Transformation']],
      ['Composition', 'Libellé'],
      'Liste des compositions'
    );
  });

  it('should export data as Excel', () => {
    const mockGridApi = jasmine.createSpyObj('GridApi', ['getColumnDefs', 'forEachNodeAfterFilterAndSort']);
    const mockColumnDefs = [
      { field: 'code', headerName: 'Composition' },
      { field: 'libelle', headerName: 'Libellé' },
    ];
    const mockData = [
      { code: 'D', libelle: 'Conversion Docbridge' },
    ];

    mockGridApi.getColumnDefs.and.returnValue(mockColumnDefs);
    mockGridApi.forEachNodeAfterFilterAndSort.and.callFake((callback) => {
      mockData.forEach(data => callback({ data }));
    });

    component.gridApi = mockGridApi;
    component.export({ type: 'exportAsExcel' });

    expect(mockGenerateFileService.generateExcelFile).toHaveBeenCalledWith(
      [['D', 'Conversion Docbridge']],
      ['Composition', 'Libellé'],
      'Liste des compositions'
    );
  });

  it('should not save when editedRow is empty', () => {
    const editedRow = new Map();

    component.onSaveEdition(editedRow);

    expect(mockApiAdelaideService.createComposition).not.toHaveBeenCalled();
    expect(mockApiAdelaideService.updateComposition).not.toHaveBeenCalled();
  });

  it('should have correct permission properties', () => {
    expect(component.canAddPermPosition).toBeDefined();
    expect(component.canRemovePermPosition).toBeDefined();
  });
});
